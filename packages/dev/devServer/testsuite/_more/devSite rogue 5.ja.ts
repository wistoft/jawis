import { TestProvision } from "^jarun";
import { sleeping } from "^jab";

export default (prov: TestProvision) => {
  sleeping(200).then(() => {
    prov.chk("asdf");
  });
};
