import path from "path";
import { execNpmAndGetStdout } from "./util/index";

import { looping } from "^yapu/yapu";
import { getLiveBuildVersionInfo } from "./build/util3";

/**
 *
 */
export const doit = async () => {
  const { torelease, toignore } = await getLiveBuildVersionInfo();

  console.log({ torelease, toignore });

  //release

  const otp = "";

  // looping(torelease, async (fullPackageName) => {
  //   const out = await execNpmAndGetStdout(
  //     "npm publish -otp=" + otp,
  //     path.join("E:/work/repos/jawis-master/build/publish", fullPackageName)
  //   );

  //   console.log(out);
  // });
};

doit();
