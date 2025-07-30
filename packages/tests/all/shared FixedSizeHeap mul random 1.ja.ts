import { err, getRandomRange } from "^jab";
import { TestProvision } from "^jarun";
import { Allocation, FixedSizeHeap } from "^shared-algs";
import {
  getSharedChunkHeap,
  getSharedListHeap,
  getSharedTreeHeap,
} from "^tests/_fixture";

export default (prov: TestProvision) => {
  const maxSize = getRandomRange(1, 30);
  const dataSize = 4 * getRandomRange(1, 10);
  const pageSize = dataSize * getRandomRange(6, 10);

  const h1 = getSharedTreeHeap(prov, { maxSize, dataSize });
  const h2 = getSharedListHeap(prov, { maxSize, dataSize });
  const h3 = getSharedChunkHeap(prov, { pageSize, dataSize });

  const test1 = new TestCase(prov, h1);
  const test2 = new TestCase(prov, h2);
  const test3 = new TestCase(prov, h3);

  for (let amount = 1; amount <= maxSize; amount++) {
    for (let repeats = 0; repeats < 10; repeats++) {
      test1.run(amount);
      test2.run(amount);
      test3.run(amount);
    }
  }

  h3.dispose();
};

class TestCase {
  public controlArray: Array<[Allocation<Uint8Array>, number]> = [];
  public trace: string[] = [];

  constructor(
    private prov: TestProvision,
    private heap: FixedSizeHeap
  ) {}

  /**
   *
   */
  run(amount: number) {
    try {
      //increase

      for (let i = 0; i < amount; i++) {
        this.add();
        this.remove();
        this.add();
      }

      //stable

      for (let i = 0; i < amount; i++) {
        this.remove();
        this.add();
      }

      //decrease

      for (let i = 0; i < amount; i++) {
        this.remove();
        this.add();
        this.remove();
      }

      //empty again

      this.prov.eq(0, this.heap.count);
    } catch (error) {
      // console.log(this.trace.join("\n"));
      throw error;
    }
  }

  /**
   *
   */
  add() {
    const n = Math.floor(256 * Math.random());
    let alloc;

    try {
      alloc = this.heap.allocate(Uint8Array);
      this.trace.push("let a" + alloc.ref + " = heap.allocate(Uint8Array);");
    } catch (error) {
      this.trace.push("heap.allocate(Uint8Array);");
      throw error;
    }

    alloc.array.fill(n);

    //add to state

    this.controlArray.push([alloc, n]);
  }

  /**
   *
   */
  remove() {
    const index = Math.floor(this.controlArray.length * Math.random());
    const [alloc, n] = this.controlArray[index];

    this.trace.push("heap.deallocate(" + alloc.ref + ");");

    const data = { n, ...alloc };

    if (alloc.array.some((val) => val !== n)) {
      err("Data is wrong", data);
    }

    const clone = this.heap.get(alloc.ref, Uint8Array);

    if (clone.some((val) => val !== n)) {
      err("Data is wrong in clone", { ...data, clone });
    }

    //remove from state

    this.heap.deallocate(alloc.ref);

    this.controlArray.splice(index, 1);
  }
}
