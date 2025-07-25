import { TestProvision } from "^jarun";
import { clonedToHtml_test, toHtml_test } from "../_fixture";

export default async (prov: TestProvision) => {
  prov.log("true", await toHtml_test(true));
  prov.log("true & false", await toHtml_test([true, false]));

  prov.log(
    "promise",
    (await toHtml_test(Promise.resolve())).replace("JarunPromise : ", "")
  );

  prov.log("resouce", await clonedToHtml_test(["resource", "stream"]));
};
