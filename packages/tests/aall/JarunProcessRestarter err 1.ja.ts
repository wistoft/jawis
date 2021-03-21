import { TestProvision } from "^jarun";
import { getProcessRestarter } from "../_fixture";

// doesn't return promise, so process is forgotten. But kills anyway.

export default (prov: TestProvision) => {
  getProcessRestarter(prov);
};
