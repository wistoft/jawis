import { TestProvision } from "^jarun";

import { getPrettyHtml, getViewTestLogContent } from "../_fixture";

//different

export default async (prov: TestProvision) => {
  prov.log(
    "number prefix is italic, when equal",
    await getPrettyHtml( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: [1] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when added",
    await getPrettyHtml( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [], cur: [2] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when deleted",
    await getPrettyHtml( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [3], cur: [] }, }) ) // prettier-ignore
  );

  prov.log(
    "number prefix is italic, when prefix is deleted",
    await getPrettyHtml( getViewTestLogContent({ testLog: { type: "user", name: "myLog", exp: [2], cur: ["2"] }, }) ) // prettier-ignore
  );
};
