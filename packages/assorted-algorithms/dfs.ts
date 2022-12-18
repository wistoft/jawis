/**
 * returns all reachable nodes from the given node.
 *
 * - Edges are defined by a map from node-id to node-ids.
 */
export const dfs = <Id>(id: Id, adjList: (id: Id) => Set<Id> | undefined) => {
  const res = helper(id, adjList, new Set());

  if (res) {
    return res;
  } else {
    return new Set<Id>();
  }
};

/**
 *
 */
const helper = <Id>(
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

      helper(val, adjList, seen);
    }
  }

  return seen;
};
