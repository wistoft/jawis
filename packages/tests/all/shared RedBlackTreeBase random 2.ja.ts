import { TestProvision } from "^jarun";
import { getUint32RedBlackTree } from "^tests/_fixture";

const shuffle = require("knuth-shuffle-seeded");

//insert random numbers, delete in random order.

export default (prov: TestProvision) => {
  const tree = getUint32RedBlackTree(prov);

  let added;
  let removed;

  const trace = [];

  try {
    for (let amount = 0; amount < 50; amount++)
      for (let repeats = 0; repeats < 10; repeats++) {
        added = [];
        removed = [];

        for (let i = 0; i < amount; i++) {
          const n = Math.floor(1e8 * Math.random());
          added.push(n);
          trace.push("tree.set(" + n + ", " + n + ");");

          prov.eq(undefined, tree.get(n));
          tree.set(n, n);
          prov.eq(n, tree.get(n));
        }

        //delete again

        const removeOrder = shuffle(added);

        for (const n of removeOrder) {
          removed.push(n);
          trace.push("tree.delete(" + n + ");");

          prov.eq(n, tree.get(n));
          tree.delete(n);
          prov.eq(undefined, tree.get(n));
        }
      }
  } catch (error) {
    console.log("Added: ", added);
    console.log("Removed", removed);
    console.log("Trace", trace.join("\n"));
    throw error;
  }
};
