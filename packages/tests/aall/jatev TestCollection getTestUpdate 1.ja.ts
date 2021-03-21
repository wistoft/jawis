import { TestProvision } from "^jarun";
import { testSelectionToCollection } from "^jatev/TestCollection";

export default ({ eq }: TestProvision) => {
  const empty = testSelectionToCollection([]);

  eq([], empty.tests);

  const a = testSelectionToCollection([[{ id: "1" }]]);

  const a2 = a.getTestUpdate({ id: "1", status: 0, testLogs: [] });
  const a3 = a.getTestUpdate({ id: "1", status: 1, testLogs: [] });

  eq([[{ id: "1" }]], a.tests);
  eq([[{ id: "1", status: 0, testLogs: [] }]], a2.tests);
  eq([[{ id: "1", status: 1, testLogs: [] }]], a3.tests);
};
