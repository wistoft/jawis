import { assert, FinallyFunc } from "^jab";

import { niceWait, WaitFunc } from "^jab-node";

export const LockSharedArrayLength = 2;

export const MasterLockIndex = 0;
export const LockStateIndex = 1;

export const MasterLockBit = 0b1;

export const ExclusiveLockValue = -1; //the uint32 representation of 0xffffffff

/**
 *
 */
export type ExclusiveKey<T> = {
  type: T;
  token: Symbol;
  exclusive: true;
  parent?: ExclusiveKey<T>;
};

/**
 *
 */
export type SharedKey<T> = {
  type: T;
  token: Symbol;
};

export type LockDeps<T extends string> = {
  sharedArray: Int32Array;
  type: T;
  timeout: number;
  softTimeout?: number;
  finally: FinallyFunc;

  //for testing

  wait?: WaitFunc;
  DateNow?: () => number;
};

/**
 *
 * - Handles the logic of shared and exlusive locks.
 *    - Shared keys are only valid for read. Because others hold the lock, and expect nothing changes.
 *    - Exclusive keys are valid for write, and read as well, because no one else holds the lock.
 * - Gives a reliable way to determine, if this thread has locked the lock. By returning a key object,
 *    that proofs this thread holds the lock.
 * - Protects against releasing, if the key isn't held.
 * - When releasing the key becomes invalid. It can't for instance be released twice.
 * - Protection against deadlock if the same thread tries the take a lock that is confliting
 *    with locks it already holds. Blocking would otherwise result in deadlock, because the
 *    thread stops execution, and will never release the locks, that must happen before it continue.
 * - The same thread can hold multiple shared locks, because it won't be blocked when acquiring them. It's
 *    also perfectly fine to release the shared locks in any order.
 * - Exclusive lock support re-entry if the key of the existing exclusive key is provided.
 *      - A new key is returned, that must be released before the old key is.
 *      - The old key will become invalid, until the new key is released.
 * - Good Luck!
 *
 * memory format
 *  1. element
 *    1 bit   master lock
 *  2. element
 *    - number of readers.
 *    - except for 0xffffffff which denotes exclusive locked.
 *
 * todo
 *  it should be posible to avoid master lock
 *  check for overflow of reader count :-)
 * notes
 *  master and acquisition can't wait on same index.
 */
export class Lock<T extends string> {
  //Set if this thread holds an exclusive key.

  private currentKey?: ExclusiveKey<T>;

  //Contains the shared keys this thread holds.
  //only used by this thread, so doesn't need to be protected by master lock.

  private sharedKey = new Set<SharedKey<T>>();

  // for testing

  private AtomicsWait: WaitFunc;
  private DateNow: () => number;

  /**
   *
   */
  constructor(private deps: LockDeps<T>) {
    assert(this.deps.sharedArray.length === LockSharedArrayLength, "SharedArray should have size " + LockSharedArrayLength + ", was:" + this.deps.sharedArray.length); // prettier-ignore

    this.AtomicsWait = this.deps.wait || Atomics.wait;
    this.DateNow = this.deps.DateNow || Date.now;

    deps.finally(() => {
      assert(this.sharedKey.size === 0, "Shared should be unlocked on finally: " + this.deps.type + " (count: " + this.sharedKey.size + ")"); // prettier-ignore
      assert(this.currentKey === undefined, "Exclusive should be unlocked on finally: " + this.deps.type); // prettier-ignore
    });
  }

  /**
   *
   */
  public pack = () => ({
    sharedArray: this.deps.sharedArray,
    type: this.deps.type,
    timeout: this.deps.timeout,
    softTimeout: this.deps.softTimeout,
  });

  /**
   *
   */
  public getShared = (): SharedKey<T> => {
    assert(this.currentKey === undefined, "This thread already has the exclusive lock: " + this.deps.type); // prettier-ignore

    const key = {
      type: this.deps.type,
      token: Symbol("Lock"),
    };

    this.getSharedReal();

    this.sharedKey.add(key);

    return key;
  };

  /**
   * todo: has to be atomic.
   */
  public getExclusive = (existingKey?: ExclusiveKey<T>): ExclusiveKey<T> => {
    if (existingKey) {
      this.assertValidForWrite(existingKey);
    } else {
      assert(this.currentKey === undefined, "This thread already has the exclusive lock: " + this.deps.type); // prettier-ignore
      assert(this.sharedKey.size === 0, "This thread already has shared locks: " + this.deps.type); // prettier-ignore
    }

    if (!existingKey) {
      this.getExclusiveReal();
    }

    this.currentKey = {
      type: this.deps.type,
      token: Symbol("Lock"),
      exclusive: true,
      parent: existingKey,
    };

    return this.currentKey;
  };

  /**
   *
   */
  public releaseShared = (key: SharedKey<T>) => {
    const wasDeleted = this.sharedKey.delete(key);

    if (!wasDeleted) {
      throw new Error("Wrong key for: " + this.deps.type);
    }

    //unlock

    Atomics.sub(this.deps.sharedArray, LockStateIndex, 1);

    //let others try to aquire.

    Atomics.notify(this.deps.sharedArray, LockStateIndex);
  };

  /**
   * impl
   *  - Doesn't need to take master lock, because we will only mutate if we have the lock. Where all
   *      other won't make changes.
   */
  public releaseExclusive = (key: ExclusiveKey<T>) => {
    this.assertValidForWrite(key);

    this.currentKey = this.currentKey?.parent;

    if (this.currentKey) {
      //parent exists, and still holds the lock.
      return;
    }

    //unlock

    Atomics.store(this.deps.sharedArray, LockStateIndex, 0);

    //let others try to aquire.

    Atomics.notify(this.deps.sharedArray, LockStateIndex);
  };

  /**
   * Check the key is either valid shared or exclusive lock.
   *
   * impl
   *  - We don't need to check the shared array here, because the token prove we have previously locked.
   *      And we could determine from the shared array, whether this particular key/thread has the lock.
   */
  public isValidForRead = (key: SharedKey<T> | ExclusiveKey<T>) => {
    if ("exclusive" in key) {
      return this.isValidForWrite(key);
    }

    const valid = this.sharedKey.has(key);

    valid && assert(this.isShareLocked(), "Impossible. Should be shared locked here: " + this.deps.type); // prettier-ignore

    return valid;
  };

  /**
   * Check the key is valid exclusive lock.
   *
   *
   * impl
   *  - We don't need to check the shared array here, because the token prove we have previously locked.
   *      And we could determine from the shared array, whether this particular key/thread has the lock.
   */
  public isValidForWrite = (key: ExclusiveKey<T>) => {
    const valid = key === this.currentKey;

    valid && assert(this.isExclusiveLocked(), "Impossible. Should be exclusive locked here: " + this.deps.type); // prettier-ignore

    return valid;
  };

  /**
   *
   * impl
   *    - Is serializable without taking master lock, because all updates are performed atomic.
   */
  public isUnLocked = () =>
    Atomics.load(this.deps.sharedArray, LockStateIndex) === 0;

  /**
   * Does any thread hold a shared lock.
   *
   * impl
   *    - Is serializable without taking master lock, because all updates are performed atomic.
   */
  public isShareLocked = () => {
    const val = Atomics.load(this.deps.sharedArray, LockStateIndex);

    return val !== 0 && val !== ExclusiveLockValue;
  };

  /**
   * Does any thread hold an exclusive lock.
   *
   * impl
   *    - Is serializable without taking master lock, because all updates are performed atomic.
   */
  public isExclusiveLocked = () =>
    Atomics.load(this.deps.sharedArray, LockStateIndex) === ExclusiveLockValue;

  /**
   *
   */
  public thisThreadHoldsNoLock = () =>
    this.currentKey === undefined && this.sharedKey.size === 0;

  /**
   *
   */
  public assertValidForRead = (key: SharedKey<T>) => {
    if (!this.isValidForRead(key)) {
      throw new Error("Wrong key for: " + this.deps.type);
    }
  };

  /**
   *
   */
  public assertValidForWrite = (key: ExclusiveKey<T>) => {
    if (!this.isValidForWrite(key)) {
      throw new Error("Wrong key for: " + this.deps.type);
    }
  };

  /**
   *
   */
  private getSharedReal = () =>
    this._masterExec(
      (LockStateIndexValue: number) => LockStateIndexValue !== ExclusiveLockValue, // prettier-ignore
      () => Atomics.add(this.deps.sharedArray, LockStateIndex, 1)
    );

  /**
   *
   */
  private getExclusiveReal = () =>
    this._masterExec(
      (LockStateIndexValue: number) => LockStateIndexValue === 0,
      () => Atomics.store(this.deps.sharedArray, LockStateIndex, ExclusiveLockValue) // prettier-ignore
    );

  /**
   * Execute code holding the master lock.
   *
   * todo: timeout doesn't take master lock into account.
   */
  private _masterExec = (
    predicate: (LockStateIndexValue: number) => boolean,
    exec: () => void
  ) => {
    while (true) {
      this._lockMaster();

      const LockStateIndexValue = Atomics.load(this.deps.sharedArray, LockStateIndex) // prettier-ignore

      if (predicate(LockStateIndexValue)) {
        exec();
        this._unlockMaster();
        return;
      }

      this._unlockMaster();

      niceWait({
        sharedArray: this.deps.sharedArray,
        index: LockStateIndex,
        value: LockStateIndexValue,
        timeout: this.deps.timeout,
        softTimeout: this.deps.softTimeout,
        sleepCondition: () => false,
        onSoftTimeout: () => {
          console.log("Lock soft timeout: " + this.deps.type);
        },
        waitName: "Lock `" + this.deps.type + "`",
        throwOnTimeout: true,
        wait: this.AtomicsWait,
        DateNow: this.DateNow,
      });
    }
  };

  /**
   *
   * - set the master bit in the element used for locks: `lock-index`
   */
  public _lockMaster = () => {
    while (true) {
      const old = Atomics.or(
        this.deps.sharedArray,
        MasterLockIndex,
        MasterLockBit
      );

      if ((MasterLockBit & old) === 0) {
        return;
      }

      this.AtomicsWait(this.deps.sharedArray, MasterLockIndex, old, this.deps.timeout); // prettier-ignore
    }
  };

  /**
   *
   * - unset the master bit in the element used for locks: `lock-index`
   */
  public _unlockMaster = () => {
    const old = Atomics.and(this.deps.sharedArray, MasterLockIndex, ~MasterLockBit); // prettier-ignore

    if ((MasterLockBit & old) === 0) throw new Error("Master wasn't locked.");

    Atomics.notify(this.deps.sharedArray, MasterLockIndex);
  };
}
