import { TestProvision } from "^jarun";

import { getHtmlRTR } from "^misc/node";
import { getViewTestLogContent } from "../_fixture";

//different

export default (prov: TestProvision) => {
  prov.log(
    "number prefix is italic, when equal",
    getHtmlRTR( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: [1] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when added",
    getHtmlRTR( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [], cur: [2] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when deleted",
    getHtmlRTR( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [3], cur: [] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when prefix is deleted",
    getHtmlRTR( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: ["2"] }, }) ) // prettier-ignore
  );
};
