import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => [
  sleeping(100).then(() => {
    prov.imp("as promised new");
    return "ret from promise";
  }),
  Promise.resolve("hello"),
];
