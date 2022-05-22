import { sleeping } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp("hej");
  return sleeping(500);
};
