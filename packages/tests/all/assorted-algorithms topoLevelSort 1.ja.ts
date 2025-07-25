import { TestProvision } from "^jarun";
import { topologicalLevelSortObject } from "^assorted-algorithms";

export default (prov: TestProvision) => {
  // 0 nodes

  prov.eq([], topologicalLevelSortObject({}));

  // 1 node

  prov.eq(["1"], topologicalLevelSortObject({ "1": [] }));

  // 2 nodes

  prov.eq(["1", "2"], topologicalLevelSortObject({ "1": [], "2": ["1"] }));

  // 3 nodes, 2 edges

  prov.eq( ["1", "2", "3"], topologicalLevelSortObject({ "3": ["2"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3"], topologicalLevelSortObject({ "3": ["1"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3"], topologicalLevelSortObject({ "3": ["1", "2"], "2": [], "1": [] }) ); // prettier-ignore

  // 3 nodes, 3 edges

  prov.eq( ["1", "2", "3"], topologicalLevelSortObject({ "3": ["1", "2"], "2": ["1"], "1": [] }) ); // prettier-ignore

  // 4 nodes, 3 edges

  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["3"], "3": ["1", "2"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["2", "3"], "3": ["1"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["2", "3"], "3": ["1"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["3"], "3": ["1", "2"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["3"], "3": ["1", "2"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1", "2"], "3": ["2"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["2"], "3": ["2"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["3"], "3": ["1"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1"], "3": ["1"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1", "2", "3"], "3": [], "2": [], "1": [] }) ); // prettier-ignore

  // 4 nodes, 4 edges (only some combinations)

  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["3"], "3": ["1", "2"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1", "2"], "3": ["2"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1", "3"], "3": ["1"], "2": ["1"], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["1", "2", "3"], "3": ["2"], "2": [], "1": [] }) ); // prettier-ignore

  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["2", "3"], "3": ["1", "2"], "2": [], "1": [] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalLevelSortObject({"4":["2", "3"], "3": ["2"], "2": ["1"], "1": [] }) ); // prettier-ignore
};
