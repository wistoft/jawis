import { TestProvision } from "^jarun";

export default (prov: TestProvision) =>
  Promise.resolve().then(() => {
    prov.imp("as promised new");
    return "ret from promise";
  });
