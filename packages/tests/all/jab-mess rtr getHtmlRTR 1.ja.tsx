import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^jawis-mess/node";
import { plainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlRTR(plainHtmlElement));
};
