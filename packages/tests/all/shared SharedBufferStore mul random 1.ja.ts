import { getRandomUint8Array_old } from "^jab";
import { TestProvision } from "^jarun";
import { getAppendOnlyBufferStore } from "^tests/_fixture";
import { AppendOnlyBufferStore } from "^shared-buffer-store";

export default (prov: TestProvision) => {
  const store = getAppendOnlyBufferStore(prov, {
    byteSize: 10000,
  });

  const test = new TestCase(prov, store);

  for (let amount = 1; amount < 10; amount++) {
    test.testCase(amount);
  }
};

class TestCase {
  public refs: Array<[number, Uint8Array]> = [];
  public trace: string[] = [];

  constructor(
    private prov: TestProvision,
    private store: AppendOnlyBufferStore
  ) {}

  /**
   *
   */
  testCase(amount: number) {
    try {
      //increase tree

      for (let i = 0; i < amount; i++) {
        this.add();
        this.add();
        this.remove();
      }

      //stable

      for (let i = 0; i < amount; i++) {
        this.add();
        this.remove();
      }

      //decrease

      for (let i = 0; i < amount; i++) {
        this.remove();
        this.add();
        this.remove();
      }

      //empty again

      this.prov.eq(0, this.store.count);
    } catch (error) {
      console.log(this.trace.join("\n"));
      throw error;
    }
  }

  /**
   *
   */
  add() {
    const array = getRandomUint8Array_old(10);

    this.trace.push("store.add(the data);");

    const ref = this.store.add(array);

    //add to state

    this.refs.push([ref, array]);
  }

  /**
   *
   */
  remove() {
    const index = Math.floor(this.refs.length * Math.random());
    const [ref, expectedArray] = this.refs[index];

    const array = this.store.get(ref);

    this.prov.eq(expectedArray, array);

    //delete

    this.trace.push("store.delete(" + ref + ");");

    this.store.delete(ref);

    //remove from state

    this.refs.splice(index, 1);
  }
}
