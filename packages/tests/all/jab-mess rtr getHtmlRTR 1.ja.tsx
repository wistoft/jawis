import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^misc/node";
import { plainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlRTR(plainHtmlElement));
};
