import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^misc/node";
import { getJagovConsole } from "../_fixture";

export default (prov: TestProvision) => {
  prov.imp(getHtmlEnzyme(getJagovConsole()));
};
