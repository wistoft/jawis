import { TestProvision } from "^jarun";
import { group } from "^jab/util";

export default (prov: TestProvision) => {
  const arr = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

  console.log(group(arr, 1));
  console.log(group(arr, 2));
  console.log(group(arr, 3));
};
