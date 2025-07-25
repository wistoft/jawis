import { HeapFactory, TreeSet } from "^shared-algs";
import { SharedRedBlackTreeBase, SharedRedBlackTreeBaseDeps } from "./internal";

export type Uint32TreeSetDeps = {
  heapFactory: HeapFactory;

  //for testing

  verifyAfterOperations: boolean;
};

const KEY_OFFSET = 0;
const KEY_LENGTH = 1;

const NODE_SIZE = (KEY_OFFSET + KEY_LENGTH) * Uint32Array.BYTES_PER_ELEMENT; // prettier-ignore

/**
 * Map from uint32 to uint32
 *
 *  - There's an overhead of storage on 200%, because the tree must store metadata for each node,
 *      which only contain 2 uint32 of user data.
 */
export class Uint32TreeSet implements TreeSet<number> {
  private tree: SharedRedBlackTreeBase<number, null, Uint32Array>;

  /**
   *
   */
  constructor(
    public deps: Uint32TreeSetDeps,
    ref?: number
  ) {
    const subDeps: SharedRedBlackTreeBaseDeps<number, null, Uint32Array> = {
      nodeDataByteSize: NODE_SIZE,
      NodeTypedArray: Uint32Array,

      getKey: (nodeData: Uint32Array) => nodeData[KEY_OFFSET],

      setKey: (nodeData: Uint32Array, key: number) => {
        nodeData[KEY_OFFSET] = key;

        if (nodeData[KEY_OFFSET] !== key) {
          throw new Error("Impossible: " + key);
        }
      },

      getValue: () => null,
      setValue: () => {},

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
  public static getPageByteSize = () =>
    SharedRedBlackTreeBase.getPageByteSize(NODE_SIZE);

  /**
   *
   */
  public getRef = () => this.tree.getRef();

  /**
   *
   */
  public static fromRef = (deps: Uint32TreeSetDeps, ref: number) =>
    new Uint32TreeSet(deps, ref);

  /**
   *
   */
  get size() {
    return this.tree.size;
  }

  /**
   *
   */
  public has = (key: number) => this.tree.has(key);

  /**
   *
   */
  public add = (key: number) => {
    if (!Number.isInteger(key) || key < 0 || key > 0xffffffff) {
      throw new Error("Key not supported: " + key);
    }

    this.tree.set(key, null);
  };

  /**
   *
   */
  public delete = (key: number) => {
    if (!Number.isInteger(key) || key < 0 || key > 0xffffffff) {
      throw new Error("Key not supported: " + key);
    }

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
  public *[Symbol.iterator](): Generator<number> {
    for (const [val] of this.tree) {
      yield val;
    }
  }
}
