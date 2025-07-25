import { TestProvision } from "^jarun";

import { makeCapturingNodeExternals } from "^pack-util/internal";
import { getEsmProjectPath } from "../_fixture";

export default (prov: TestProvision) => {
  const capture = makeCapturingNodeExternals(getEsmProjectPath("package.json"));

  capture.onExternals({
    request: "typescript",
    context: getEsmProjectPath("fido.ts"),
  });

  capture.onExternals({
    request: "webpack",
    context: getEsmProjectPath("fido.ts"),
  });

  prov.imp(capture.getPackageJson("my-package"));
};
