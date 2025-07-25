import path from "node:path";
import { TestProvision } from "^jarun";

import { makeCapturingNodeExternals } from "^pack-util/internal";
import { getEsmProjectPath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const capture = makeCapturingNodeExternals(getEsmProjectPath("package.json"));

  capture.onExternals({
    request: "packageDontExist",
    context: path.join(__dirname, "fido.ts"),
  });

  prov.imp(capture.getPackageJson("my-package"));
};
