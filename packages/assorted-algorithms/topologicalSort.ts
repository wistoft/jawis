import { def } from "^jab";

/**
 *
 *
 * @related
 *  - https://www.npmjs.com/package/toposort
 *  - https://www.npmjs.com/package/toposort-class
 */
export const topologicalSortObject = (dag: {
  [_: string | number]: Array<string | number>;
}) =>
  topologicalSort<string | number>(
    Object.keys(dag),
    (id) => new Set(def(dag[id]))
  );

/**
 *
 */
export const topologicalSort = <Id>(
  all: Iterable<Id>,
  adjList: (id: Id) => Set<Id> | undefined
) => {
  const seen = new Set<Id>();
  const list: Id[] = [];

  for (const one of all) {
    helper(one, adjList, seen, list);
  }

  return list;
};

/**
 *
 */
const helper = <Id>(
  id: Id,
  adjList: (id: Id) => Set<Id> | undefined,
  seen: Set<Id>,
  list: Id[]
) => {
  if (seen.has(id)) {
    return;
  }

  seen.add(id);

  const direct = adjList(id);

  if (direct) {
    for (const val of direct) {
      if (!seen.has(val)) {
        helper(val, adjList, seen, list);
      }
    }
  }

  list.push(id);
};
