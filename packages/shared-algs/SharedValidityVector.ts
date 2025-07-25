import { err } from "^jab";

export type SharedValidityVectorDeps = {
  size: number;
  sharedArray: Int32Array | Uint32Array;
  useChunkVersion: boolean;
};

/**
 *
 * - Stores index version, to be able to detect invalid references.
 *
 * notes
 *  - Linear complexity. Suited for base cases in larger structures.
 *
 * todo
 *  - quick fix: uses one word per validity bit.
 */
export class SharedValidityVector {
  public static BYTE_OVERHEAD = 4; //overhead comprise version and valid bit.
  public static BLOCK_SIZE = 1; //size of the blocks that are allocated.

  /**
   *
   */
  constructor(public deps: SharedValidityVectorDeps) {
    const minimum = SharedValidityVector.getExpectedByteSize(this.deps.size);

    if (this.deps.sharedArray.byteLength < minimum) {
      err("SharedArray should minimum have byte size " + minimum + ", was:" + this.deps.sharedArray.byteLength); // prettier-ignore
    }

    this.deps.size = deps.size;
  }

  /**
   *
   */
  public static getExpectedByteSize = (n: number) =>
    Math.ceil(n / this.BLOCK_SIZE) * this.BLOCK_SIZE * this.BYTE_OVERHEAD;

  /**
   *
   */
  public get = () => {
    const index = this.tryGet();

    if (index === undefined) {
      throw new Error("Not enough space to allocate more indexes, max: " + this.deps.size); // prettier-ignore
    }

    return index;
  };

  /**
   *
   */
  public tryGet = () => {
    for (let i = 0; i < this.deps.size; i++) {
      if (this.deps.sharedArray[i] === 0) {
        let version = 1; //default

        if (this.deps.useChunkVersion) {
          version = Math.floor(Math.random() * 15) + 1; //max 4 bits, and never zero.
        }

        this.deps.sharedArray[i] = version;

        return { index: i, version };
      }
    }

    //nothing found

    return;
  };

  /**
   *
   */
  public invalidate = (index: number, version: number) => {
    if (index < 0 || index >= this.deps.size) {
      throw new Error("Index out of range: " + index);
    }

    //assert valid.

    if (this.deps.sharedArray[index] !== version) {
      throw new Error("The index is invalid: " + index);
    }

    //set invalid

    this.deps.sharedArray[index] = 0;
  };

  /**
   *
   */
  public isValid = (index: number, version: number) => {
    if (index < 0 || index >= this.deps.size) {
      throw new Error("Index out of range: " + index);
    }

    return this.deps.sharedArray[index] === version;
  };

  /**
   *
   */
  public isFull = () => {
    for (let i = 0; i < this.deps.size; i++) {
      if (this.deps.sharedArray[i] === 0) {
        return false;
      }
    }

    return true;
  };

  /**
   *
   */
  public isEmpty = () => {
    for (let i = 0; i < this.deps.size; i++) {
      if (this.deps.sharedArray[i] !== 0) {
        return false;
      }
    }

    return true;
  };

  /**
   *
   */
  public getCount = () => {
    let count = 0;
    for (let i = 0; i < this.deps.size; i++) {
      if (this.deps.sharedArray[i] !== 0) {
        count++;
      }
    }

    return count;
  };

  /**
   *
   */
  public *[Symbol.iterator](): Generator<{ index: number; version: number }> {
    for (let i = 0; i < this.deps.size; i++) {
      const version = this.deps.sharedArray[i];
      if (version !== 0) {
        yield { index: i, version };
      }
    }
  }
}
