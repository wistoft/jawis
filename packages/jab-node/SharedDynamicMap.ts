import { nodeRequire } from "./node-module-util";
import { def, err, FinallyFunc, toInt } from "^jab";
import {
  equal,
  readNumber,
  SharedBufferStore,
  writeNumber,
  murmurHash2,
  WaitFunc,
  FixedSizeHeap,
  MakeHeap,
} from "^jab-node";

//hack because of typing mismatch.

const SharedMap = nodeRequire("E:/work/repos/SharedMap");

//use typing from non-fork

//conf

export const DEFAULT_NUM_LENGTH_BYTES = 4;

//quick fix. It's defined in SharedMap.
const META = {
  maxSize: 0,
  keySize: 1,
  objSize: 2,
  length: 3,
};

type MapKey = { _pair: number; key: Uint8Array; hash: number };

export type SharedDynamicMapDeps = {
  makeHeap: MakeHeap;

  //map
  initialEntryCapacity?: number;

  //heap
  byteSize: number;
  timeout: number;
  softTimeout: number;
  finally: FinallyFunc;

  //for testing
  KEY_SIZE?: number;
  wait: WaitFunc;
};

/**
 * Extension to SharedMap
 *
 * Different from SharedMap
 *  - Dynamic allocation of key/value size.
 *  - Supports Buffers as keys and values.
 *  - Adds resizing on entries.
 *
 *
 * todo:
 *  - place the hash map in the heap.
 *  - soft overflow warning
 *  - dynamic key size
 *  - all data in shared array.
 *  - manage locking.
 */
export class SharedDynamicMap {
  //
  //map
  //

  private innerMap!: any; // SharedMapType;
  private topResizeLimit!: number;
  private bottomResizeLimit!: number;
  private initialEntryCapacity!: number;

  private defaultInitialEntryCapacity = 4; //not particularly important value.

  // Size is in UTF-16 codepoints
  private DEFAULT_KEY_SIZE = 5;

  //4 UTF-16 codepoints means we can store numbers up to 4Gi
  //4 is minimal anyway, because sharedmap rounds up.
  private VALUE_SIZE = 4;
  private KEY_SIZE;

  //
  //heap
  //

  private heap: SharedBufferStore;

  /**
   *
   */
  constructor(private deps: SharedDynamicMapDeps) {
    this.initialEntryCapacity =
      deps.initialEntryCapacity || this.defaultInitialEntryCapacity;

    this.heap = new SharedBufferStore({ ...deps, direction: "left" });

    this.KEY_SIZE = this.deps.KEY_SIZE || this.DEFAULT_KEY_SIZE; //quick for for testing.

    //the extra byte in for valid/invalid key.
    if (this.heap.header.NUM_REFERENCE_BYTES + 1 > this.KEY_SIZE) {
      throw new Error("key size too little.");
    }

    this.initInnerMap(this.initialEntryCapacity);
  }

  /**
   *
   */
  private initInnerMap(entryCapacity: number) {
    this.innerMap = new SharedMap(
      entryCapacity,
      this.KEY_SIZE,
      this.VALUE_SIZE
    );

    //resizing

    this.topResizeLimit = entryCapacity * 0.8;

    //ensure we only decrease size, if it's above initial capacity.
    this.bottomResizeLimit =
      this.innerMap.size > this.initialEntryCapacity ? entryCapacity * 0.2 : 0;

    //monkey patch

    (this.innerMap as any)._match = this._match(this.innerMap);
    (this.innerMap as any)._writeKey = this._writeKey(this.innerMap);
    (this.innerMap as any)._decodeKey = this._decodeKey(this.innerMap);
  }

  /**
   *
   */
  _match = (map: any) => (key: MapKey, pos: number) =>
    equal(this._getRealKey(map, pos).key, key.key);

  /**
   *
   */
  private _writeKey = (map: any) => (pos: number, key: { _key: number }) => {
    const index = pos * map.meta[META.keySize];

    map.keysData[index] = 1; //indicate that the position has a valid key. Zero means invalid.

    writeNumber(
      map.keysData,
      index + 1,
      key._key,
      this.heap.header.NUM_REFERENCE_BYTES
    );
  };

  /**
   *
   */
  private _decodeKey = (map: any) => (pos: number) => {
    const { _pair, key } = this._getRealKey(map, pos);

    return { _key: _pair, key, hash: murmurHash2(key) };
  };

  /**
   *
   */
  private _getRealKey = (map: any, pos: number) => {
    const index = pos * map.meta[META.keySize];

    const _pair = readNumber(
      map.keysData,
      index + 1,
      this.heap.header.NUM_REFERENCE_BYTES
    );

    const pair = this.heap.get(_pair);

    return { _pair, key: this._decodeKeyValue(pair).key };
  };

  /**
   *
   */
  get length() {
    return this.innerMap.length;
  }

  /**
   *
   */
  get size() {
    return this.innerMap.size;
  }

  /**
   *
   */
  get(key: Uint8Array) {
    const _pair = this.innerMap.get({ key, hash: murmurHash2(key) });

    if (_pair === undefined) {
      return null;
    }

    if (_pair === null) {
      throw new Error("unexpected type.");
    }

    const pair = this.heap.get(toInt(_pair));

    const decoded = this._decodeKeyValue(pair);

    return decoded.value;
  }

  /**
   *
   */
  set(key: Uint8Array, value: Uint8Array) {
    if (this.innerMap.length > this.topResizeLimit) {
      this.resize(this.innerMap.size * 2);
    }

    this.delete(key); //quick fix, to make it easier to handle the case, where a entry is replaced. Because it needs to be removed from the heap.

    const encoded = this._encodeKeyValue(key, value);

    const _pair = this.heap.add(encoded);

    this.innerMap.set({ _key: _pair, key, hash: murmurHash2(key) }, _pair);

    this.invariant();
  }

  /**
   *
   */
  delete(key: Uint8Array) {
    if (this.innerMap.length < this.bottomResizeLimit) {
      this.resize(this.innerMap.size / 2);
    }

    const innerKey = { key, hash: murmurHash2(key) };
    const _pair = this.innerMap.get(innerKey);

    if (_pair === undefined) {
      return null;
    }

    if (_pair === null) {
      throw new Error("unexpected type.");
    }

    this.innerMap.delete(innerKey);
    this.heap.delete(toInt(_pair)); //can first be deleted after the inner map, because this is used for key matching.

    this.invariant();
  }

  /**
   *
   */
  public _encodeKeyValue(key: Uint8Array, value: Uint8Array) {
    const pair = new Uint8Array(
      key.length + value.length + DEFAULT_NUM_LENGTH_BYTES
    );

    writeNumber(pair, 0, key.length, DEFAULT_NUM_LENGTH_BYTES);

    pair.set(key, DEFAULT_NUM_LENGTH_BYTES);
    pair.set(value, DEFAULT_NUM_LENGTH_BYTES + key.length);

    return pair;
  }

  /**
   *
   */
  public _decodeKeyValue(pair: Uint8Array) {
    const keyLength = readNumber(pair, 0, DEFAULT_NUM_LENGTH_BYTES);

    const key = pair.slice(
      DEFAULT_NUM_LENGTH_BYTES,
      DEFAULT_NUM_LENGTH_BYTES + keyLength
    );
    const value = pair.slice(DEFAULT_NUM_LENGTH_BYTES + keyLength);

    return { key, value };
  }

  /**
   *
   */
  private invariant() {
    if (this.innerMap.length !== this.heap.length) {
      err("Wrong size", {
        map: this.innerMap.length,
        heap: this.heap.length,
      });
    }
  }

  /**
   *
   */
  public resize(_newCapacity: number) {
    //don't go below initial capacity.
    const newCapacity = Math.max(_newCapacity, this.initialEntryCapacity);

    //resize map

    const oldMap = this.innerMap;

    this.initInnerMap(newCapacity);

    for (const key of oldMap.keys()) {
      this.innerMap.set(key, def(oldMap.get(key)));
    }

    //deallocate old heap

    // oldMap.dispose();
  }

  /**
   *
   */
  public dispose() {}
}
