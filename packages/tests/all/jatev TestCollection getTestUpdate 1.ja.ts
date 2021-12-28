import { TestProvision } from "^jarun";
import { testSelectionToCollection } from "^jatev/TestCollection";
import { testSelectionToCollection_for_tests } from "^tests/_fixture";

export default ({ eq }: TestProvision) => {
  const empty = testSelectionToCollection([]);

  eq([], empty.tests);

  const a = testSelectionToCollection_for_tests([
    [{ id: "1", name: "1", file: "file" }],
  ]);

  const a2 = a.getTestUpdate({ id: "1", name:"1", file:"file", status: 0, testLogs: [] }); // prettier-ignore
  const a3 = a.getTestUpdate({ id: "1", name:"1", file:"file", status: 1, testLogs: [] }); // prettier-ignore

  eq([[{ id: "1", name: "1", file: "file" }]], a.tests);
  eq([[{ id: "1", name: "1", file: "file", status: 0, testLogs: [] }]], a2.tests); // prettier-ignore
  eq([[{ id: "1", name: "1", file: "file", status: 1, testLogs: [] }]], a3.tests); // prettier-ignore
};
