import { TestProvision } from "^jarun";
import { getTestIdx } from "^jatev/TestCollection";

export default ({ eq }: TestProvision) => {
  eq([0, 0], getTestIdx([[{ id: "1" }]], "1"));

  eq([1, 0], getTestIdx([[], [{ id: "1" }]], "1"));

  eq([0, 0], getTestIdx([[{ id: "1" }], [{ id: "2" }]], "1"));
  eq([1, 0], getTestIdx([[{ id: "1" }], [{ id: "2" }]], "2"));

  eq([1, 0], getTestIdx([[], [{ id: "1" }, { id: "2" }]], "1"));
  eq([1, 1], getTestIdx([[], [{ id: "1" }, { id: "2" }]], "2"));
};
