import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { getPlainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlEnzyme(getPlainHtmlElement()));
};
