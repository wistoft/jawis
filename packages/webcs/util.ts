import fs from "node:fs";
import path from "node:path";
import { GetUrlToRequire, pathJoin } from "^jab";

/**
 * Switch automatically between development and production version of a script.
 */
export const makeGetUrlToRequire =
  (deps1: {
    staticWebFolder: string;
    webRootUrl: string;
    webCsUrl: string;
  }): GetUrlToRequire =>
  (deps2) => {
    const prod = path.join(deps1.staticWebFolder, deps2.file + ".js");

    if (fs.existsSync(prod)) {
      return pathJoin(deps1.webRootUrl, deps2.file + ".js");
    }

    //must be development environment. It will be compiled on the fly.

    return pathJoin(deps1.webCsUrl, deps2.folder, deps2.file + ".ts");
  };
