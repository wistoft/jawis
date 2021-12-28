import { TestProvision } from "^jarun";
import { testSelectionToCollection_for_tests } from "^tests/_fixture";

export default ({ eq }: TestProvision) => {
  const a = testSelectionToCollection_for_tests([
    [{ id: "1", name: "1", file: "file" }],
  ]);

  eq({ id: "1", name: "1", file: "file" }, a.getTest("1"));
};
