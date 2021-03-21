import { TestProvision } from "^jarun";
import { testSelectionToCollection } from "^jatev/TestCollection";

export default ({ eq }: TestProvision) => {
  const a = testSelectionToCollection([[{ id: "1" }]]);

  eq({ id: "1" }, a.getTest("1"));
};
