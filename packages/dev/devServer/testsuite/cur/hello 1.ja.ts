import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  // prov.chk(false);
  // throw new Error("ups");
  // prov.onError(new Error("ups"));
  prov.onError(new Error("igen"));

  (() => {
    throw new Error("ups");
  })();
};
