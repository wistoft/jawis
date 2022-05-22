import { err } from "^jab";

export type SharedValidityVectorDeps = {
  size: number;
  sharedArray: Int32Array;
};

/**
 * Static and linear complexity. Suited for base cases in larger structures.
 *
 *  - quick fix: uses one word per validity bit.
 *    - todo: Use 1 byte for each validity bit. 7 bits are used for version.
 *  - Fine grain locked.
 *
 */
export class SharedValidityVector {
  private size!: number;

  public static BYTE_OVERHEAD = 4; //overhead comprise version and valid bit.
  public static BLOCK_SIZE = 1; //size of the blocks that are allocated.

  /**
   *
   */
  constructor(public deps: SharedValidityVectorDeps) {
    this.setSize(deps.size);
  }

  /**
   *
   */
  public static getExpectedBytesize = (n: number) =>
    this._getExpectedBytesize(n, this.BLOCK_SIZE, this.BYTE_OVERHEAD);

  /**
   *
   */
  public static _getExpectedBytesize = (
    n: number,
    blockSize: number,
    overhead: number
  ) => Math.ceil(n / blockSize) * blockSize * overhead;

  /**
   * todo: check bits aren't set in space that is shrunk.
   */
  public setSize = (size: number) => {
    const minimum = SharedValidityVector.getExpectedBytesize(this.deps.size);

    if (this.deps.sharedArray.byteLength < minimum) {
      err("SharedArray should minimum have byte size " + minimum + ", was:" + this.deps.sharedArray.byteLength); // prettier-ignore
    }

    this.size = size;
  };

  /**
   *
   */
  public get = () => {
    const index = this.tryGet();

    if (index === undefined) {
      throw new Error("Not enough space to allocate more indexes, max: " + this.size); // prettier-ignore
    }

    return index;
  };

  /**
   *
   */
  public tryGet = () => {
    for (let i = 0; i < this.size; i++) {
      if (this.deps.sharedArray[i] === 0) {
        const version = Math.floor(Math.random() * 15) + 1; //max 4 bits, and never zero.
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
    if (index < 0 || index >= this.size) {
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
    if (index < 0 || index >= this.size) {
      throw new Error("Index out of range: " + index);
    }

    return this.deps.sharedArray[index] === version;
  };

  /**
   *
   */
  public isFull = () => {
    for (let i = 0; i < this.size; i++) {
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
    for (let i = 0; i < this.size; i++) {
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
    for (let i = 0; i < this.size; i++) {
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
    for (let i = 0; i < this.size; i++) {
      const version = this.deps.sharedArray[i];
      if (version !== 0) {
        yield { index: i, version };
      }
    }
  }
}
