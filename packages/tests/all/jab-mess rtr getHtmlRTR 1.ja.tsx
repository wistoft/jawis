import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^misc/node";
import { getPlainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlRTR(getPlainHtmlElement()));
};
