import { TestProvision } from "^jarun";
import { range } from "^jab/util";

export default (prov: TestProvision) => {
  console.log(range(0, 0, 0));
  console.log(range(1, 0, 1));
  console.log(range(1, 1, 1));
  console.log(range(2, 0, 2));
};
