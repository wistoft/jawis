import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

//insert random numbers, delete in same order.

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  let ns;

  try {
    for (let amount = 0; amount < 50; amount++)
      for (let repeats = 0; repeats < 10; repeats++) {
        ns = [];

        for (let i = amount; i > 0; i--) {
          const n = Math.floor(1e8 * Math.random());
          ns.push(n);
          prov.eq(undefined, tree.get(n));
          tree.set(n, n);
          prov.eq(n, tree.get(n));
        }

        //delete again

        for (const n of ns) {
          prov.eq(n, tree.get(n));
          tree.delete(n);
          prov.eq(undefined, tree.get(n));
        }
      }
  } catch (error) {
    console.log(ns);
    throw error;
  }
};
