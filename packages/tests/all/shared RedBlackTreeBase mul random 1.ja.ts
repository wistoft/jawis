import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

//insert random numbers, delete in same order.

export default (prov: TestProvision) => {
  let entries: number[] = [];
  const history: string[] = [];

  const tree = getUint32TreeMap(prov);

  try {
    for (let amount = 0; amount < 50; amount++)
      for (let repeats = 0; repeats < 10; repeats++) {
        entries = [];

        for (let i = amount; i > 0; i--) {
          set();
        }

        //delete again

        for (const n of entries) {
          remove(n);
        }
      }
  } catch (error) {
    console.log(entries);
    console.log(history.join("\n"));
    throw error;
  }

  tree.dispose();

  //
  // functions
  //

  /**
   *
   */
  function rand() {
    const n = Math.floor(1e8 * Math.random());

    const has = entries.some((x) => x === n);

    if (!has) {
      entries.push(n);
    }

    return { n, has };
  }

  /**
   *
   */
  function set() {
    const { n, has } = rand();

    history.push("tree.set(" + n + ", " + n + ");");

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
  function remove(n: number) {
    if (entries.length === 0) {
      return;
    }

    history.push("tree.delete(" + n + ");");

    prov.eq(n, tree.get(n));
    tree.delete(n);
    prov.eq(undefined, tree.get(n));
  }
};
