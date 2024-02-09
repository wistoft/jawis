import { TestProvision } from "^jarun";
import { getHtml } from "^misc/node";
import { plainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtml(plainHtmlElement));
};
