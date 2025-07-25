import { def } from "^jab";

/**
 * Return a topological sort level by level.
 *
 * definition
 *  - Let all nodes without outgoing edges have level 0.
 *  - The level of all other nodes is one plus the maximum level of nodes pointed to.
 */
export const topologicalLevelSortObject = (dag: {
  [_: string | number]: Array<string | number>;
}) =>
  topologicalLevelSort<string | number>(
    Object.keys(dag),
    (id) => new Set(def(dag[id]))
  );

/**
 *
 */
export const topologicalLevelSortObject2 = (dag: {
  [_: string | number]: Array<string | number>;
}) =>
  topologicalLevelSort2<string | number>(
    Object.keys(dag),
    (id) => new Set(def(dag[id]))
  );

/**
 *
 */
export const topologicalLevelSort = <Id>(
  all: Iterable<Id>,
  adjList: (id: Id) => Set<Id> | undefined
) => {
  const map = new Map<Id, number>();
  const stack = new Set<Id>();

  //assign a level to each id.

  for (const one of all) {
    helper(one, adjList, stack, map);
  }

  // sort lowest levels first

  return Array.from(map.entries())
    .sort((a, b) => a[1] - b[1])
    .map((x) => x[0]);
};

/**
 *
 */
export const topologicalLevelSort2 = <Id>(
  all: Iterable<Id>,
  adjList: (id: Id) => Set<Id> | undefined
) => {
  const map = new Map<Id, number>();
  const stack = new Set<Id>();

  //assign a level to each id.

  for (const one of all) {
    helper(one, adjList, stack, map);
  }

  //format

  const res: any = {};

  for (const [id, level] of map.entries()) {
    let tmp = res[level];

    if (!tmp) {
      tmp = [];
      res[level] = tmp;
    }

    tmp.push(id);
  }

  return res;
};

/**
 *
 */
const helper = <Id>(
  id: Id,
  adjList: (id: Id) => Set<Id> | undefined,
  seen: Set<Id>,
  map: Map<Id, number>
) => {
  if (map.has(id)) {
    return map.get(id) as number;
  }

  if (seen.has(id)) {
    throw new Error("Cycle");
  }

  seen.add(id); //to avoid cycles

  //recurse

  const direct = adjList(id);

  let level = 0;

  if (direct) {
    for (const val of direct) {
      const tmp = 1 + helper(val, adjList, seen, map);
      level = Math.max(level, tmp);
    }
  }

  // this node may be traversed again now.

  seen.delete(id);

  // cache and return the level

  map.set(id, level);

  return level;
};
