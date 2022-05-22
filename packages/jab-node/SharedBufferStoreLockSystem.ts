import { assert, assertNever, def } from "^jab";

import { ExclusiveKey, Lock, NLock, SharedKey, LockDeps } from "^jab-node";

export type SharedBufferStoreLockSystemDeps = {
  exclusiveLockSharedArray: Int32Array;
  metaWriteSharedArray: Int32Array;
} & Omit<LockDeps<any>, "type" | "sharedArray">;

/**
 *
 * notes
 *  - exclusive and meta locks are statically allocation.
 *  - the heap contains r2i, r2li and entry-locks. But they are locked by the master lock.
 *      - Because these can shrink and expand.
 *  - no need for locks to deleted entries. Only prune will access them.
 */
export class SharedBufferStoreLockSystem {
  public exclusiveLock: Lock<"exclusive">;
  public metaWriteLock: Lock<"meta">;
  private entryLock: NLock<"entry">;

  //for supporting exclusive lock.

  private exclusiveMetaKey?: ExclusiveKey<"meta">;
  private exclusiveEntryReadKey?: ExclusiveKey<"entry">;

  //udgår - ref is in [0,n]
  private refToLockIndex = new Map<number, number>();

  /**
   *
   */
  constructor(public deps: SharedBufferStoreLockSystemDeps) {
    const n = 100;

    this.exclusiveLock = new Lock({ ...deps, type: "exclusive", sharedArray: this.deps.exclusiveLockSharedArray,}); // prettier-ignore
    this.metaWriteLock = new Lock({ ...deps, type: "meta", sharedArray: this.deps.metaWriteSharedArray,}); // prettier-ignore
    this.entryLock = new NLock({ ...deps, type: "entry", n, sharedArray: new Int32Array(new SharedArrayBuffer(NLock.getExpectedBytesize(n))),}); // prettier-ignore
  }

  /**
   * udgår.
   */
  public onNewEntry = (ref: number) => {
    this.refToLockIndex.set(ref, this.entryLock.allocate());
  };

  /**
   * udgår.
   */
  public onDeleteEntry = (ref: number) => {
    this.entryLock.deallocate(def(this.refToLockIndex.get(ref)));
    this.refToLockIndex.delete(ref);
  };

  /**
   *
   */
  public getExclusive = (outerMetaKey?: ExclusiveKey<"meta">) => {
    const exclusiveKey = this.exclusiveLock.getExclusive();

    if (this.exclusiveMetaKey) {
      throw new Error("exclusiveEntryReadKey should not be set here.");
    }

    if (this.exclusiveEntryReadKey) {
      throw new Error("exclusiveEntryReadKey should not be set here.");
    }

    try {
      //todo: Take the locks in parallel.
      this.exclusiveMetaKey = this.metaWriteLock.getExclusive(outerMetaKey);
      this.exclusiveEntryReadKey = this.entryLock.getFullExclusive();

      return exclusiveKey;
    } catch (e) {
      this.exclusiveLock.releaseExclusive(exclusiveKey);

      this.exclusiveMetaKey && this.metaWriteLock.releaseExclusive(this.exclusiveMetaKey); // prettier-ignore
      this.exclusiveEntryReadKey && this.entryLock.releaseFullExclusive(this.exclusiveEntryReadKey); // prettier-ignore

      throw e;
    }
  };

  /**
   *
   */
  public releaseExclusive = (key: ExclusiveKey<"exclusive">) => {
    assert(key.parent === undefined, "Can't have parent, when re-entry not supported"); // prettier-ignore

    this.metaWriteLock.releaseExclusive(def(this.exclusiveMetaKey));
    this.entryLock.releaseFullExclusive(def(this.exclusiveEntryReadKey));

    this.exclusiveMetaKey = undefined;
    this.exclusiveEntryReadKey = undefined;

    this.exclusiveLock.releaseExclusive(key);
  };

  /**
   *
   */
  public getEntryShared(ref: number) {
    const lockIndex = this.refToLockIndex.get(ref);

    if (lockIndex === undefined) {
      throw new Error("Unknown reference: " + ref);
    }

    return this.entryLock.getShared(lockIndex);
  }

  /**
   *
   */
  public releaseEntryShared(ref: number, key: SharedKey<"entry">) {
    const lockIndex = def(this.refToLockIndex.get(ref));
    this.entryLock.releaseShared(lockIndex, key);
  }

  /**
   *
   */
  public getEntryExclusive(ref: number, outerRefKey?: ExclusiveKey<"entry">) {
    const lockIndex = this.refToLockIndex.get(ref);

    if (lockIndex === undefined) {
      throw new Error("Unknown reference: " + ref);
    }

    return this.entryLock.getExclusive(lockIndex, outerRefKey);
  }

  /**
   *
   */
  public releaseEntryExclusive(ref: number, key: ExclusiveKey<"entry">) {
    const lockIndex = def(this.refToLockIndex.get(ref));
    this.entryLock.releaseExclusive(lockIndex, key);
  }

  /**
   *
   */
  public assertMeta = (
    key: ExclusiveKey<"meta"> | ExclusiveKey<"exclusive">
  ) => {
    switch (key.type) {
      case "meta":
        this.metaWriteLock.assertValidForWrite(key);
        break;
      case "exclusive":
        this.exclusiveLock.assertValidForWrite(key);
        break;

      default:
        return assertNever(key);
    }
  };

  /**
   *
   */
  public assertEntryRead = (
    key: SharedKey<"entry"> | ExclusiveKey<"entry"> | ExclusiveKey<"exclusive">,
    refQuickFix?: number
  ) => {
    const lockIndex = refQuickFix && this.refToLockIndex.get(refQuickFix);
    switch (key.type) {
      case "entry":
        return this.entryLock.assertValidForRead(def(lockIndex), key);
      case "exclusive":
        return this.exclusiveLock.assertValidForWrite(key);

      default:
        return assertNever(key);
    }
  };

  /**
   *
   */
  public assertEntryWrite = (
    key: ExclusiveKey<"entry"> | ExclusiveKey<"exclusive">,
    refQuickFix?: number
  ) => {
    const lockIndex = refQuickFix && this.refToLockIndex.get(refQuickFix);
    switch (key.type) {
      case "entry":
        return this.entryLock.assertValidForWrite(def(lockIndex), key);
      case "exclusive":
        return this.exclusiveLock.assertValidForWrite(key);

      default:
        return assertNever(key);
    }
  };
}
