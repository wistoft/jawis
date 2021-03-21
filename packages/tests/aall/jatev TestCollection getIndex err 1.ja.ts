import { TestProvision } from "^jarun";
import { getTestIdx } from "^jatev/TestCollection";

export default (prov: TestProvision) => {
  prov.catch(() => getTestIdx([], "1"));
};
