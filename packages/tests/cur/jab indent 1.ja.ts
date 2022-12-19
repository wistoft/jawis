import { indent } from "^jab";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp(indent("hej"));
  prov.imp(indent("hej\ndav"));
};
