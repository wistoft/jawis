import fs from "fs";
import path from "path";

import { getLiveBuildVersionInfo } from "./build/util3";
import { projectRoot } from "^dev/project.conf";

/**
 *
 */
export const doit = async () => {
  const info = await getLiveBuildVersionInfo();

  // Generate release script

  let script = "";

  for (const { packageName, latestVersion, repoVersion } of info) {
    if (latestVersion !== repoVersion) {
      const folder = path.join("build/publish", packageName);
      script += `( cd "${folder}" && npm publish --access public --otp= ; )\n`;
      console.log("To release: " + packageName);
    } else {
      console.log("Ignoring: " + packageName);
    }
  }

  // Write release script

  fs.promises.writeFile(path.join(projectRoot, "release.sh"), script);
};

doit();
