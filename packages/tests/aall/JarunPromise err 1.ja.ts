import { TestProvision } from "^jarun";
import { newJarunPromise } from "../_fixture";

export default (prov: TestProvision) =>
  newJarunPromise(prov, (resolve, reject) => {
    reject(new Error("no no"));
  });
