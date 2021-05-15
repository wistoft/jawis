import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { plainHtmlElement } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlEnzyme(plainHtmlElement));
};
