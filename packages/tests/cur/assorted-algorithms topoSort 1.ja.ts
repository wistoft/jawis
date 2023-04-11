import { TestProvision } from "^jarun";
import { topologicalSortObject } from "^assorted-algorithms";

export default (prov: TestProvision) => {
  prov.eq([], topologicalSortObject({}));
  prov.eq(["1"], topologicalSortObject({ "1": [] }));
  prov.eq(["1", "2"], topologicalSortObject({ "1": [], "2": ["1"] }));
  prov.eq( ["1", "2", "3"], topologicalSortObject({ "1": [], "2": ["1"], "3": ["2"] }) ); // prettier-ignore

  //fan in

  prov.eq( ["1", "2", "3"], topologicalSortObject({ "1": [], "2": ["1"], "3": ["1"] }) ); // prettier-ignore
  prov.eq( ["1", "2", "3", "4"], topologicalSortObject({ "1": [], "2": ["1"], "3": ["1"], "4":["2", "3"] }) ); // prettier-ignore

  //cycle

  prov.eq( ["1"], topologicalSortObject({ "1": ["1"],  }) ); // prettier-ignore

  //additional

  prov.eq( ["2", "1"], topologicalSortObject({ "1": ["2"], "2":[]  }) ); // prettier-ignore
};
