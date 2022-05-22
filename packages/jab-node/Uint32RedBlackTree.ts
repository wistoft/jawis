import { SharedRedBlackTreeBase } from "./SharedRedBlackTreeBase";
import { FixedSizeHeap, MakeHeap, TreeMap } from "./SharedUtil";
import {
  HEAP_CHUNCK_SIZE,
  KEY_OFFSET,
  VALUE_OFFSET,
} from "./SharedRedBlackTreeBase";

export type Uint32RedBlackTreeDeps = {
  makeHeap: MakeHeap;

  //for testing

  verifyAfterOperations: boolean;
};

/**
 * Map from uint32 to uint32
 *
 *  - There's an overhead of storage on 200%, because the tree must store metadata for each node,
 *      which only contain 2 uint32 of user data.
 */
export class Uint32TreeMap implements TreeMap<number, number> {
  private tree: SharedRedBlackTreeBase<number, number, Uint32Array>;
  private heap: FixedSizeHeap;

  /**
   *
   */
  constructor(private deps: Uint32RedBlackTreeDeps) {
    this.heap = deps.makeHeap(HEAP_CHUNCK_SIZE);

    this.tree = new SharedRedBlackTreeBase({
      heap: this.heap,
      nodeDataSize: 8,
      NodeTypedArray: Uint32Array,

      getKey: (nodeData: Uint32Array) => {
        return nodeData[KEY_OFFSET];
      },
      setKey: (nodeData: Uint32Array, key: number) => {
        nodeData[KEY_OFFSET] = key;

        if (nodeData[KEY_OFFSET] !== key) {
          throw new Error("Key not supported: " + key);
        }
      },

      getValue: (nodeData: Uint32Array) => {
        return nodeData[VALUE_OFFSET];
      },
      setValue: (nodeData: Uint32Array, value: number) => {
        nodeData[VALUE_OFFSET] = value;

        if (nodeData[VALUE_OFFSET] !== value) {
          throw new Error("Value not supported: " + value);
        }
      },

      keyEquals: (
        nodeData1?: Uint32Array | number,
        nodeData2?: Uint32Array
      ) => {
        if (typeof nodeData1 === "number") {
          return nodeData1 === nodeData2?.[KEY_OFFSET];
        } else {
          return nodeData1?.[KEY_OFFSET] === nodeData2?.[KEY_OFFSET];
        }
      },
      keyLessThan: (key: number, nodeData2: Uint32Array) => {
        return key < nodeData2?.[KEY_OFFSET];
      },
      ...deps,
    });
  }

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
  public set = (key: number, value: number) => {
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
  public toString = () => this.heap?.toString?.() ?? "Uint32RedBlackTree";
}
