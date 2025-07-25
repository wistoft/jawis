import { HeapFactory, TreeMap } from "^shared-algs";
import { SharedRedBlackTreeBase } from "./internal";

export type Uint32TreeMapDeps = {
  heapFactory: HeapFactory;

  //for testing

  verifyAfterOperations: boolean;
};

const KEY_OFFSET = 0;
const KEY_LENGTH = 1;

const VALUE_OFFSET = KEY_OFFSET + KEY_LENGTH;
const VALUE_LENGTH = 1;

const NODE_SIZE = (VALUE_OFFSET + VALUE_LENGTH) * Uint32Array.BYTES_PER_ELEMENT; // prettier-ignore

/**
 * Map from uint32 to uint32
 *
 *  - There's an overhead of storage on 200%, because the tree must store metadata for each node,
 *      which only contain 2 uint32 of user data.
 */
export class Uint32TreeMap implements TreeMap<number, number> {
  private tree: SharedRedBlackTreeBase<number, number, Uint32Array>;

  /**
   *
   */
  constructor(deps: Uint32TreeMapDeps, ref?: number) {
    const subDeps = {
      nodeDataByteSize: NODE_SIZE,
      NodeTypedArray: Uint32Array,

      getKey: (nodeData: Uint32Array) => nodeData[KEY_OFFSET],

      setKey: (nodeData: Uint32Array, key: number) => {
        nodeData[KEY_OFFSET] = key;

        if (nodeData[KEY_OFFSET] !== key) {
          throw new Error("Impossible: " + key);
        }
      },

      getValue: (nodeData: Uint32Array) => nodeData[VALUE_OFFSET],

      setValue: (nodeData: Uint32Array, value: number) => {
        nodeData[VALUE_OFFSET] = value;

        if (nodeData[VALUE_OFFSET] !== value) {
          throw new Error("Impossible: " + value);
        }
      },

      keyEquals: (nodeData1: Uint32Array | number, nodeData2: Uint32Array) => {
        if (typeof nodeData1 === "number") {
          return nodeData1 === nodeData2[KEY_OFFSET];
        } else {
          return nodeData1[KEY_OFFSET] === nodeData2[KEY_OFFSET];
        }
      },

      keyLessThan: (key: number, nodeData2: Uint32Array) =>
        key < nodeData2[KEY_OFFSET],

      ...deps,
    };

    if (ref === undefined) {
      this.tree = new SharedRedBlackTreeBase(subDeps);
    } else {
      this.tree = SharedRedBlackTreeBase.fromRef(subDeps, ref);
    }
  }

  /**
   *
   */
  public getRef = () => this.tree.getRef();

  /**
   *
   */
  public static fromRef = (deps: Uint32TreeMapDeps, ref: number) =>
    new Uint32TreeMap(deps, ref);

  /**
   *
   */
  get size() {
    return this.tree.size;
  }

  /**
   *
   */
  public get = (key: number) => this.tree.get(key);

  /**
   *
   */
  public has = (key: number) => this.tree.has(key);

  /**
   *
   */
  public set = (key: number, value: number) => {
    if (!Number.isInteger(key) || key < 0 || key > 0xffffffff) {
      throw new Error("Key not supported: " + key);
    }

    if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
      throw new Error("Value not supported: " + value);
    }

    this.tree.set(key, value);
  };

  /**
   *
   */
  public delete = (key: number) => {
    this.tree.delete(key);
  };

  /**
   *
   */
  public dispose = () => {
    this.tree.dispose();
  };

  /**
   *
   */
  public [Symbol.iterator] = () => this.tree[Symbol.iterator]();
}
