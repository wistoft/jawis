import { TestProvision } from "^jarun";
import { getPrettyHtml, getPlainHtmlElement } from "../_fixture";

export default async (prov: TestProvision) => {
  prov.imp(await getPrettyHtml(getPlainHtmlElement()));
};
