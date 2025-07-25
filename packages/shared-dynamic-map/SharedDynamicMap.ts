import { assert, assertEq, makeTypedArray } from "^jab";
import {
  Allocation,
  BufferStore,
  equal,
  readNumber,
  writeNumber,
} from "^shared-algs";
import {
  Uint32TreeMap,
  Uint32TreeMapDeps,
  Uint32TreeSet,
  Uint32TreeSetDeps,
} from "^shared-tree";
import {
  ExclusiveKey,
  ReadWriteLock,
  ReadWriteLockDeps,
  LockSharedArrayLength,
  SharedLockBytes,
} from "^shared-lock";

import { murmurHash2 } from "./internal";

export type SharedDynamicMapDeps = {
  ref?: number;
  bufferStore: BufferStore;

  //internal: used for unpack. (default: false)
  innerMapRef?: number;

  //for testing
  hashFunction?: (data: Uint8Array) => number;
  verifyAfterOperations: boolean;
} & Uint32TreeMapDeps &
  Uint32TreeSetDeps &
  Omit<ReadWriteLockDeps<any>, "type" | "sharedArray">;

const KEY_LENGTH_BYTES = 4;

//meta data

const NODE_COUNT_OFFSET = 0; //number of allocated chunks.

const LOCK_OFFSET = NODE_COUNT_OFFSET + 1;
const lockLength = SharedLockBytes / Uint32Array.BYTES_PER_ELEMENT;

const META_DATA_LENGTH = LOCK_OFFSET + lockLength;

const META_DATA_BYTES = Uint32Array.BYTES_PER_ELEMENT * META_DATA_LENGTH;

/**
 * Map with keys/values of variably sized Uint8Array's
 *
 *  - Dynamic allocation of key/value size.
 *  - Supports Buffers as keys and values.
 *  - Auto resizing
 *
 * structure of key/value encoding
 *   4 bytes   key length
 *   x bytes   key
 *   y bytes   value
 *
 * impl
 *  - We need a hash of the key in order to deliver fast lookup.
 *  - key/value is encoded and stored in the buffer store. The reference is then stored in the innerMap.
 *  - There's a shared heap for all Uint32TreeSet and Uint32TreeMap
 *
 * internal data structures
 *  innerMap      key hash => keySetRef
 *  keySet        keySetRef => keyValueRef
 *  bufferStore   keyValueRef => keyValue
 *
 */
export class SharedDynamicMap {
  private innerMap: Uint32TreeMap;

  private decl: Allocation<Uint32Array>;
  public lock: ReadWriteLock<"dynamic-map">;

  //to avoid name clash
  private subDeps: Uint32TreeMapDeps & Uint32TreeSetDeps;

  private hashFunction;

  /**
   *
   */
  constructor(public deps: SharedDynamicMapDeps) {
    this.subDeps = {
      heapFactory: deps.heapFactory,
      verifyAfterOperations: deps.verifyAfterOperations,
    };

    if (deps.innerMapRef === undefined) {
      this.innerMap = new Uint32TreeMap(this.subDeps);
    } else {
      this.innerMap = Uint32TreeMap.fromRef(this.subDeps, deps.innerMapRef);
    }

    this.hashFunction = this.deps.hashFunction ?? murmurHash2;

    //quick fix to ensure the heap-size is created, because the heap-factory is packed, and it can't send
    //  metadata back from remote

    const tmp = new Uint32TreeSet(this.subDeps);
    tmp.dispose();

    //state

    if (deps.ref !== undefined) {
      this.decl = {
        ref: deps.ref,
        array: this.deps.heapFactory.get(META_DATA_BYTES).get(deps.ref, Uint32Array), // prettier-ignore
      };
    } else {
      this.decl = this.deps.heapFactory.get(META_DATA_BYTES).allocate(Uint32Array); // prettier-ignore

      //initialize

      this.decl.array[NODE_COUNT_OFFSET] = 0;
    }

    // the global lock

    this.lock = new ReadWriteLock({
      ...deps,
      type: "dynamic-map",
      sharedArray: makeTypedArray(
        this.decl.array,
        Int32Array,
        LOCK_OFFSET * Uint32Array.BYTES_PER_ELEMENT,
        LockSharedArrayLength
      ),
    });
  }

  /**
   * todo
   *  - can't really pack bufferStore and heapFactory, because we don't know the actual type.
   *  - innerMapRef might not be the best solution.
   *  - does this need a lock?
   */
  public pack = () => {
    assert(this.deps.hashFunction === undefined, "Can't pack deps.hashFunction"); // prettier-ignore

    const globalKey = this.lock.getExclusive();

    try {
      return {
        bufferStorePack: this.deps.bufferStore.pack(),
        heapFactoryPack: this.deps.heapFactory.pack(),
        ref: this.decl.ref,
        innerMapRef: this.innerMap.getRef(),
        verifyAfterOperations: this.deps.verifyAfterOperations,
      };
    } finally {
      this.lock.releaseExclusive(globalKey);
    }
  };

  /**
   * todo: what about the lock.
   */
  public get count() {
    return this.decl.array[NODE_COUNT_OFFSET];
  }

  /**
   *
   */
  private set count(value: number) {
    this.decl.array[NODE_COUNT_OFFSET] = value;
  }

  /**
   * todo: returned value is a reference to shared data, so the key should actually not be released, until the Uint8Array is garbage collected.
   */
  public get(key: Uint8Array) {
    const globalKey = this.lock.getExclusive();

    try {
      const searchResult = this.search(key);

      return searchResult?.value;
    } finally {
      this.lock.releaseExclusive(globalKey);
    }
  }

  /**
   *
   * note
   *  - if the key already has a value, then its new value could have a different size.
   */
  public set(key: Uint8Array, value: Uint8Array) {
    const globalKey = this.lock.getExclusive();

    try {
      const keyHash = this.hashFunction(key);

      const searchResult = this.search(key);

      //delete existing keyValue

      if (searchResult !== undefined) {
        this.deps.bufferStore.delete(searchResult.keyValueRef);
        searchResult.keySet!.delete(searchResult.keyValueRef);
        //no need to also change the innerMap, because we add a new entry below, anyway.
      } else {
        //the key doesn't have a value already, so increase.
        this.count++;
      }

      //store new keyValue

      const keyValueRef = this.deps.bufferStore.add(
        this._encodeKeyValue(key, value)
      );

      //

      const keySet = this.getKeySet(keyHash);

      keySet.add(keyValueRef);

      this.deps.verifyAfterOperations && this.invariant();
    } finally {
      this.lock.releaseExclusive(globalKey);
    }
  }

  /**
   *
   */
  public delete(key: Uint8Array, existingKey?: ExclusiveKey<"dynamic-map">) {
    const globalKey = this.lock.getExclusive(existingKey);

    try {
      const searchResult = this.search(key);

      if (searchResult === undefined) {
        return;
      }

      this.count--;

      //delete keyValueRef

      searchResult.keySet!.delete(searchResult.keyValueRef);

      if (searchResult.keySet!.size === 0) {
        //delete keySet

        searchResult.keySet.dispose();
        this.innerMap.delete(searchResult.keyHash);
      }

      //delete keyValue

      this.deps.bufferStore.delete(searchResult.keyValueRef);

      this.deps.verifyAfterOperations && this.invariant();
    } finally {
      this.lock.releaseExclusive(globalKey);
    }
  }

  /**
   *
   */
  private search(searchKey: Uint8Array) {
    const keyHash = this.hashFunction(searchKey);
    const keySetRef = this.innerMap.get(keyHash);

    if (keySetRef === undefined) {
      return;
    }

    const keySet = Uint32TreeSet.fromRef(this.subDeps, keySetRef);

    for (const keyValueRef of keySet) {
      const keyValue = this.deps.bufferStore.get(keyValueRef);

      const { key, value } = this._decodeKeyValue(keyValue);

      if (equal(searchKey, key)) {
        return { keyValueRef, key, value, keyHash, keySet };
      }
    }
  }

  /**
   * Create an object, if it doesn't exist
   */
  private getKeySet(keyHash: number) {
    const keySetRef = this.innerMap.get(keyHash);

    if (keySetRef === undefined) {
      const keySet = new Uint32TreeSet(this.subDeps);

      this.innerMap.set(keyHash, keySet.getRef());

      return keySet;
    } else {
      return Uint32TreeSet.fromRef(this.subDeps, keySetRef);
    }
  }

  /**
   * todo: this does unneeded copy to temporary array. If buffer supported allocate, we could do just one.
   */
  private _encodeKeyValue(key: Uint8Array, value: Uint8Array) {
    const pair = new Uint8Array(key.length + value.length + KEY_LENGTH_BYTES);

    writeNumber(pair, 0, key.length, KEY_LENGTH_BYTES);

    pair.set(key, KEY_LENGTH_BYTES);
    pair.set(value, KEY_LENGTH_BYTES + key.length);

    return pair;
  }

  /**
   *
   */
  private _decodeKeyValue(keyValue: Uint8Array) {
    const keyLength = readNumber(keyValue, 0, KEY_LENGTH_BYTES);

    const key = makeTypedArray(
      keyValue,
      Uint8Array,
      KEY_LENGTH_BYTES,
      keyLength
    );

    const value = makeTypedArray(
      keyValue,
      Uint8Array,
      KEY_LENGTH_BYTES + keyLength,
      keyValue.byteLength - KEY_LENGTH_BYTES - keyLength
    );

    return { key, value };
  }

  /**
   *
   */
  private invariant() {
    let countFromSets = 0;

    for (const [keyHash, keySetRef] of this.innerMap) {
      const keySet = Uint32TreeSet.fromRef(this.subDeps, keySetRef);

      countFromSets += keySet.size;

      //loop over keySet

      for (const keyValueRef of keySet) {
        try {
          const keyValue = this.deps.bufferStore.get(keyValueRef);

          const { key } = this._decodeKeyValue(keyValue);

          const actualKeyHash = this.hashFunction(key);

          //check the keyHash from innerMap match the one stored in the buffer store

          assertEq(keyHash, actualKeyHash);
        } catch (error) {
          console.log("could not lookup keyValueRef: " + keyValueRef);
        }
      }
    }

    assertEq(this.count, this.deps.bufferStore.count); // there must be exactly one keyValue for a entry.
    assertEq(this.count, countFromSets);
  }

  /**
   * Assumes a lock is held.
   */
  private *privateIterator(): Generator<[Uint8Array, Uint8Array]> {
    for (const [_, keySetRef] of this.innerMap) {
      const keySet = Uint32TreeSet.fromRef(this.subDeps, keySetRef);

      //loop over keySet

      for (const keyValueRef of keySet) {
        const keyValue = this.deps.bufferStore.get(keyValueRef);

        const { key, value } = this._decodeKeyValue(keyValue);

        yield [key, value];
      }
    }
  }

  /**
   *
   */
  public dispose() {
    const globalKey = this.lock.getExclusive();

    //remove all elements

    const keys: Uint8Array[] = []; //all keys, so we don't mutate and iterate at the same time.

    for (const [key] of this.privateIterator()) {
      keys.push(key);
    }

    for (const key of keys) {
      this.delete(key, globalKey);
    }

    //dispose rest

    assert(this.count === 0, "Can only dispose when empty: " + this.count);

    this.innerMap.dispose();

    this.lock.releaseExclusive(globalKey); //does this matter, the lock is deallocated below, any way.

    this.deps.heapFactory.get(META_DATA_BYTES).deallocate(this.decl.ref);
  }
}
