import { TestProvision } from "^jarun";
import { topologicalLevelSortObject } from "^assorted-algorithms";

export default (prov: TestProvision) => {
  topologicalLevelSortObject({ "1": ["1"] });
};
