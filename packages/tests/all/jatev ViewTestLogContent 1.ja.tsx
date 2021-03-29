import { TestProvision } from "^jarun";

import { getHtmlEnzyme } from "^jawis-mess/node";
import { getViewTestLogContent } from "../_fixture";

//different

export default (prov: TestProvision) => {
  prov.log(
    "number prefix is italic, when equal",
    getHtmlEnzyme( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: [1] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when added",
    getHtmlEnzyme( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [], cur: [2] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when deleted",
    getHtmlEnzyme( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [3], cur: [] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when prefix is deleted",
    getHtmlEnzyme( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: ["2"] }, }) ) // prettier-ignore
  );
};
//
//
//
