import { TestProvision } from "^jarun";
import { getUint32TreeMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const entries: number[] = [];
  const history: string[] = [];

  const tree = getUint32TreeMap(prov);

  for (let amount = 0; amount < 20; amount++) {
    for (let repeats = 0; repeats < 1; repeats++) {
      try {
        //increase tree

        for (let i = 0; i < amount; i++) {
          set(amount);
          set(amount);
          remove();
        }

        //stable

        for (let i = 0; i < amount; i++) {
          set(amount);
          remove();
        }

        //decrease

        for (let i = 0; i < amount; i++) {
          remove();
          set(amount);
          remove();
        }
      } catch (error) {
        console.log(history);
        console.log(entries);
        throw error;
      }
    }
  }

  tree.dispose();

  //
  // functions
  //

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
  function set(amount: number) {
    const { n, has } = rand(amount);

    history.push("Set: " + n);

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

    history.push("Delete: " + n);

    entries.splice(index, 1);

    prov.eq(n, tree.get(n));
    tree.delete(n);
    prov.eq(undefined, tree.get(n));
  }
};
