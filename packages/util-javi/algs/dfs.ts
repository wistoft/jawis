/**
 * returns all reachable nodes from the given node.
 *
 * - Edges are defined by a map from node-ids to connected nodes.
 */
export const dfs = <Id>(id: Id, adjList: (id: Id) => Set<Id> | undefined) => {
  const res = dfsHelper(id, adjList, new Set());

  if (res) {
    return res;
  } else {
    return new Set<Id>();
  }
};

/**
 *
 */
const dfsHelper = <Id>(
  id: Id,
  adjList: (id: Id) => Set<Id> | undefined,
  seen: Set<Id>
) => {
  const direct = adjList(id);

  if (!direct) {
    return;
  }

  for (const val of direct) {
    if (!seen.has(val)) {
      seen.add(val);

      dfsHelper(val, adjList, seen);
    }
  }

  return seen;
};
