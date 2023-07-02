import path from "path";
import { execNpmAndGetStdout } from "./util/index";

import { looping } from "^yapu/yapu";
import { getLiveBuildVersionInfo } from "./build/util3";
import { publishBuildFolder } from "^dev/project.conf";
import { tos } from "^jab";

/**
 *
 */
export const doit = async () => {
  const { torelease, toignore } = await getLiveBuildVersionInfo();

  console.log(tos({ torelease, toignore }));

  //release

  const otp = "";

  looping(torelease, async (fullPackageName) => {
    const out = await execNpmAndGetStdout(
      "npm publish --access public -otp=" + otp,
      path.join(publishBuildFolder, fullPackageName)
    );

    console.log(out);
  });
};

doit();
