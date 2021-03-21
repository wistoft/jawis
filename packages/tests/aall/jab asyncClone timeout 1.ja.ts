import { asyncClone } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) =>
  asyncClone([new Promise(() => {})], 10, () => {});
