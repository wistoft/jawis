import { assert } from "^jab";
import { niceWait, WaitFunc } from "^jab";
import { FinallyFunc } from "^finally-provider";

export const LockSharedArrayLength = 2;
export const SharedLockBytes = LockSharedArrayLength * 4;

const MasterLockIndex = 0;
const LockStateIndex = 1;

const MasterLockBit = 0x80000000;

const ExclusiveLockValue = -1; //the int32 representation of 0xffffffff

const shared = Symbol("Shared");
const exclusive = Symbol("Exclusive");

//type only used abstractly
export type ExclusiveKey<T> = {
  [exclusive]: T;
};

//type only used abstractly
export type SharedKey<T> = {
  [shared]: T;
};

export type ReadWriteLockDeps<T extends string> = {
  sharedArray: Int32Array;
  // Only used for error messages by this lock. The user can use the generics to avoid confusing different locks and keys.
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
 * - A key object is a reliable way to determine, if this thread has locked the lock. By returning a key object,
 *    that proofs this thread holds the lock.
 * - Protects against releasing, if the key isn't held.
 * - A released key becomes invalid. It can't for instance be released twice.
 * - Protection against deadlock if the same thread tries the take a lock that is confliting
 *    with locks it already holds. Blocking would otherwise result in deadlock, because the
 *    thread stops execution, and will never release the locks, that must happen before it continues.
 * - The same thread can hold multiple shared locks, because it won't be blocked when acquiring them. It's
 *    also perfectly fine to release the shared locks in any order.
 * - Exclusive lock supports re-entry if the current exclusive key is provided.
 *      - A new key is returned, that must be released before the old key.
 *      - The old key will become invalid, until the new key is released.
 *
 * memory format
 *  1. element
 *    1 bit   master lock
 *  2. element
 *    - number of readers.
 *    - except for 0xffffffff which denotes exclusive locked.
 *
 * impl
 *  - this.exclusiveKey and this.sharedKey is used to check the user upholds needed constraints.
 *  - this.exclusiveKey and this.sharedKey is only used by this thread, so doesn't need to be stored in shared array.
 *  - it might be possible to avoid two array indices, but it would require more (errorprone) bit fiddling.
 *
 * todo
 *  check for overflow of reader count :-)
 */
export class ReadWriteLock<T extends string> {
  //Contains the exclusive keys if this thread holds some. Index zero holds the current exclusive key, if any.

  private exclusiveKey: ExclusiveKey<T>[] = [];

  //Contains the shared keys this thread holds.

  private sharedKey = new Set<any>();

  // for testing

  private AtomicsWait: WaitFunc;
  private DateNow: () => number;

  /**
   *
   */
  constructor(private deps: ReadWriteLockDeps<T>) {
    assert(this.deps.sharedArray.length === LockSharedArrayLength, "SharedArray should have size " + LockSharedArrayLength + ", was:" + this.deps.sharedArray.length); // prettier-ignore

    this.AtomicsWait = this.deps.wait || Atomics.wait;
    this.DateNow = this.deps.DateNow || Date.now;

    deps.finally(() => {
      assert(this.sharedKey.size === 0, "Shared should be unlocked on finally: " + this.deps.type + " (count: " + this.sharedKey.size + ")"); // prettier-ignore
      assert(this.exclusiveKey.length === 0, "Exclusive should be unlocked on finally: " + this.deps.type); // prettier-ignore
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
    assert(this.exclusiveKey.length === 0, "This thread already has the exclusive lock: " + this.deps.type); // prettier-ignore

    this.getSharedReal();

    const key = {} as SharedKey<T>;

    this.sharedKey.add(key);

    return key;
  };

  /**
   *
   */
  public getExclusive = (existingKey?: ExclusiveKey<T>): ExclusiveKey<T> => {
    if (existingKey) {
      this.assertValidForWrite(existingKey);
    } else {
      assert(this.sharedKey.size === 0, "This thread already has shared locks: " + this.deps.type); // prettier-ignore
      assert(this.exclusiveKey.length === 0, "This thread already has the exclusive lock: " + this.deps.type); // prettier-ignore

      this.getExclusiveReal();
    }

    const key = {} as ExclusiveKey<T>;

    this.exclusiveKey.unshift(key);

    return key;
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
   *  - Doesn't need to take master lock, because we will only mutate if we have the lock.
   */
  public releaseExclusive = (key: ExclusiveKey<T>) => {
    this.assertValidForWrite(key);

    this.exclusiveKey.shift();

    if (this.exclusiveKey[0]) {
      //parent exists, and still holds the lock.
      return;
    }

    //unlock

    Atomics.store(this.deps.sharedArray, LockStateIndex, 0);

    //let others try to aquire.

    Atomics.notify(this.deps.sharedArray, LockStateIndex);
  };

  /**
   * Check the key is either a valid shared or exclusive key.
   *
   * impl
   *  - We don't need to check the shared array here, because the key prove we have previously locked.
   */
  public isValidForRead = (key: SharedKey<T> | ExclusiveKey<T>) =>
    key === this.exclusiveKey[0] || this.sharedKey.has(key);

  /**
   * Check the key is a valid exclusive key.
   *
   * impl
   *  - We don't need to check the shared array here, because the token prove we have previously locked.
   */
  public isValidForWrite = (key: ExclusiveKey<T>) =>
    key === this.exclusiveKey[0];

  /**
   *
   * impl
   *    - Is serializable without taking master lock, because all updates are performed atomically.
   */
  public isUnLocked = () =>
    Atomics.load(this.deps.sharedArray, LockStateIndex) === 0;

  /**
   * Does any thread hold a shared lock.
   *
   */
  public isShareLocked = () => {
    const val = Atomics.load(this.deps.sharedArray, LockStateIndex);

    return val !== 0 && val !== ExclusiveLockValue;
  };

  /**
   * Does any thread hold an exclusive lock.
   *
   */
  public isExclusiveLocked = () =>
    Atomics.load(this.deps.sharedArray, LockStateIndex) === ExclusiveLockValue;

  /**
   *
   */
  public thisThreadHoldsNoLock = () =>
    this.exclusiveKey.length === 0 && this.sharedKey.size === 0;

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
    // eslint-disable-next-line no-constant-condition
    while (true) {
      this.lockMaster();

      const LockStateIndexValue = Atomics.load(this.deps.sharedArray, LockStateIndex) // prettier-ignore

      if (predicate(LockStateIndexValue)) {
        exec();
        this.unlockMaster();
        return;
      }

      this.unlockMaster();

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
   * - set the master bit in the element used for master lock: MasterLockIndex
   */
  private lockMaster = () => {
    // eslint-disable-next-line no-constant-condition
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
   * - unset the master bit in the element used for master lock: MasterLockIndex
   */
  private unlockMaster = () => {
    const old = Atomics.and(this.deps.sharedArray, MasterLockIndex, ~MasterLockBit); // prettier-ignore

    if ((MasterLockBit & old) === 0) throw new Error("Master wasn't locked.");

    Atomics.notify(this.deps.sharedArray, MasterLockIndex);
  };
}
