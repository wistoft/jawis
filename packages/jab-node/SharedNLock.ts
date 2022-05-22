import { assert, err } from "^jab";

import {
  ExclusiveKey,
  Lock,
  LockDeps,
  LockSharedArrayLength,
  SharedKey,
} from "./SharedLock";

export type NLockDeps<T extends string> = LockDeps<T> & {
  n: number;
  sharedArray: Int32Array;
};

/**
 * udgår - eller laves i hvert fald om.
 *
 *
 * - Manage the shared array for the n locks.
 * - Provide a lock mutual exclusive with the n locks.
 *
 * impl
 *  - Individual locks take a shared lock on `fullExclusiveLock`, so they exclude the full exclusive.
 */
export class NLock<T extends string> {
  private locks = new Map<number, Lock<T>>();
  private fullExclusiveLock: Lock<any>;

  private EXCLUSIVE_LOCK_OFFSET = 0;
  private nLockOffset = 1 * LockSharedArrayLength;

  //
  // mess
  //

  private indexes = new Set<number>();

  /**
   *
   * shared array is devided sections of size `SharedArrayLength`
   *    1.    is used for fullExclusiveLock
   *    rest  is used for the `n` locks.
   */
  constructor(public deps: NLockDeps<T>) {
    const expected = NLock.getExpectedBytesize(this.deps.n);

    if (this.deps.sharedArray.byteLength !== expected) {
      err("SharedArray should have byte size " + expected + ", was:" + this.deps.sharedArray.byteLength); // prettier-ignore
    }

    this.fullExclusiveLock = new Lock({
      ...deps,
      type: this.deps.type + "-full-lock",
      sharedArray: this.deps.sharedArray.subarray(
        this.EXCLUSIVE_LOCK_OFFSET,
        this.EXCLUSIVE_LOCK_OFFSET + LockSharedArrayLength
      ),
    });
  }

  /**
   *
   */
  public static getExpectedBytesize = (n: number) =>
    (n + 1) * LockSharedArrayLength * 4;

  /**
   *
   */
  public getFullExclusive = () => {
    assert(!this.fullExclusiveLock.isShareLocked(), "This thread already has individual locks: " + this.deps.type); // prettier-ignore

    return this.fullExclusiveLock.getExclusive();
  };

  /**
   *
   */
  public releaseFullExclusive = (key: ExclusiveKey<T>) =>
    this.fullExclusiveLock.releaseExclusive(key);

  /**
   *
   */
  public allocate = (): number => {
    let index;

    for (let i = 0; i < this.deps.n; i++) {
      if (!this.indexes.has(i)) {
        index = i;
        break;
      }
    }

    // const index = this.indexQuickFix++;

    if (index === undefined) {
      throw new Error("Not enough space to allocate more indexes, max: " + this.deps.n); // prettier-ignore
    }

    this.indexes.add(index);

    return index;
  };

  /**
   *
   */
  public deallocate = (index: number) => {
    const lock = this.locks.get(index);

    if (lock && !lock.isUnLocked()) {
      throw new Error("Can't deallocate an index, that is locked: " + index);
    }

    //now delete

    const wasDeleted = this.indexes.delete(index);

    if (!wasDeleted) {
      throw new Error("Unknown index: " + index);
    }
  };

  /**
   *
   */
  public getShared = (index: number): SharedKey<T> =>
    this._getHelper(index, false);

  /**
   *
   */
  public getExclusive = (
    index: number,
    existingKey?: ExclusiveKey<T>
  ): ExclusiveKey<T> => this._getHelper(index, true, existingKey);

  /**
   *
   */
  public _getHelper = (
    index: number,
    exclusive: boolean,
    existingKey?: ExclusiveKey<T>
  ): any => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    const fullShared = this.fullExclusiveLock.getShared();

    try {
      //make the lock object

      let lock = this.locks.get(index);

      if (!lock) {
        const offset = this.nLockOffset + index * LockSharedArrayLength;

        lock = new Lock({
          ...this.deps,
          sharedArray: this.deps.sharedArray.subarray(
            offset,
            offset + LockSharedArrayLength
          ),
        });

        this.locks.set(index, lock);
      }

      //get the lock

      let key;

      if (exclusive) {
        key = lock.getExclusive(existingKey);
      } else {
        key = lock.getShared();
      }

      //store the shared key for `fullExclusiveLock`

      (key as any).fullShared = fullShared;

      return key;
    } catch (e) {
      this.fullExclusiveLock.releaseShared(fullShared);

      throw e;
    }
  };

  /**
   *
   */
  public releaseShared = (index: number, key: SharedKey<T>) => {
    this._releaseHelper(index, key, false);
  };

  /**
   *
   */
  public releaseExclusive = (index: number, key: ExclusiveKey<T>) => {
    this._releaseHelper(index, key, true);
  };

  /**
   *
   */
  public _releaseHelper = (
    index: number,
    key: SharedKey<T> | ExclusiveKey<T>,
    exclusive: boolean
  ) => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    const currentLock = this.locks.get(index);

    if (!currentLock) {
      throw new Error("Not locked: " + this.deps.type);
    }

    if (exclusive) {
      if (!("exclusive" in key)) {
        throw new Error("Impossible.");
      }
      currentLock.releaseExclusive(key);
    } else {
      currentLock.releaseShared(key);
    }

    //bookkeeping

    this.fullExclusiveLock.releaseShared((key as any).fullShared);
  };

  /**
   *
   */
  public isValidForRead = (
    index: number,
    key: SharedKey<T> | ExclusiveKey<T>
  ) => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    return this.locks.get(index)?.isValidForRead(key);
  };

  /**
   *
   */
  public isValidForWrite = (index: number, key: ExclusiveKey<T>) => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    return this.locks.get(index)?.isValidForWrite(key);
  };

  /**
   *
   */
  public assertValidForRead = (
    index: number,
    key: SharedKey<T> | ExclusiveKey<T>
  ) => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    this.locks.get(index)?.assertValidForRead(key);
  };

  /**
   *
   */
  public assertValidForWrite = (index: number, key: ExclusiveKey<T>) => {
    assert(this.indexes.has(index), "Unknown index: " + index);

    this.locks.get(index)?.assertValidForWrite(key);
  };
}
