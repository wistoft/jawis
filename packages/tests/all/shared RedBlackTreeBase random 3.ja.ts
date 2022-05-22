import { RedBlackTreeProv } from "^jab-node";
import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const entries: number[] = [];
  const history: string[] = [];

  const tree = getUint32RedBlackTree(prov);

  for (let amount = 0; amount < 20; amount++) {
    for (let repeats = 0; repeats < 1; repeats++) {
      testCase(amount);
    }
  }

  //
  // functions
  //

  /**
   *
   */
  function testCase(amount: number) {
    try {
      //increase tree

      for (let i = 0; i < amount; i++) {
        add(amount);
        add(amount);
        remove();
      }

      //stable

      for (let i = 0; i < amount; i++) {
        add(amount);
        remove();
      }

      //decrease

      for (let i = 0; i < amount; i++) {
        remove();
        add(amount);
        remove();
      }
    } catch (error) {
      console.log(history);
      console.log(entries);
      throw error;
    }
  }

  /**
   *
   */
  function rand(amount: number) {
    const n = Math.floor(10 * amount * Math.random());

    const has = entries.some((x) => x === n);

    if (!has) {
      entries.push(n);
    }

    return { n, has };
  }

  /**
   *
   */
  function add(amount: number) {
    const { n, has } = rand(amount);

    history.push("Add: " + n);

    if (has) {
      prov.eq(n, tree.get(n));
    } else {
      prov.eq(undefined, tree.get(n));
    }

    tree.set(n, n);
    prov.eq(n, tree.get(n));
  }

  /**
   *
   */
  function remove() {
    if (entries.length === 0) {
      return;
    }

    const index = Math.floor(entries.length * Math.random());
    const n = entries[index];

    history.push("Remove: " + n);

    entries.splice(index, 1);

    prov.eq(n, tree.get(n));
    tree.delete(n);
    prov.eq(undefined, tree.get(n));
  }
};
