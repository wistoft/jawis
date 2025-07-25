import { assert, WaitFunc } from "^jab";
import { FinallyFunc } from "^finally-provider";

const ArrayLength = 1;
const ArrayIndex = 0;
const LockBit = 0b1; // could be customizable

type Deps = {
  sharedArray: Int32Array;
  finally: FinallyFunc;

  //for testing

  wait?: WaitFunc;
};

/**
 *
 */
export class BinaryLock {
  private AtomicsWait: WaitFunc;

  /**
   *
   */
  constructor(private deps: Deps) {
    assert(this.deps.sharedArray.length === ArrayLength, "SharedArray should have size " + ArrayLength + ", was:" + this.deps.sharedArray.length); // prettier-ignore

    this.AtomicsWait = this.deps.wait || Atomics.wait;

    deps.finally(() => {
      assert(!this.isLocked(), "Should be unlocked on finally.");
    });
  }

  /**
   *
   */
  public pack = () => ({
    sharedArray: this.deps.sharedArray,
  });

  /**
   *
   */
  public isLocked = () => Atomics.load(this.deps.sharedArray, ArrayIndex) === 1;

  /**
   *
   * - set the master bit in the element used for master lock: MasterLockIndex
   */
  public lock = () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const old = Atomics.or(this.deps.sharedArray, ArrayIndex, LockBit);

      if ((LockBit & old) === 0) {
        return;
      }

      this.AtomicsWait(this.deps.sharedArray, ArrayIndex, old);
    }
  };

  /**
   *
   * - unset the master bit in the element used for master lock: MasterLockIndex
   */
  public unlock = () => {
    const old = Atomics.and(this.deps.sharedArray, ArrayIndex, ~LockBit);

    if ((LockBit & old) === 0) throw new Error("Master wasn't locked.");

    Atomics.notify(this.deps.sharedArray, ArrayIndex);
  };
}
