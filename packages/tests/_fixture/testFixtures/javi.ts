import path from "path";

import { FullJaviConf } from "^javi/types";

const projectConf = require("../../../../packages/dev/project.conf");

/**
 *
 */
export const filterConfig = (conf: FullJaviConf) => {
  const scriptFolders = conf.scriptFolders.map((str) =>
    path.relative(projectConf.projectRoot, str).replace(/\\/g, "/")
  );

  const scripts = conf.scripts.map((obj) => ({
    ...obj,
    script: path
      .relative(projectConf.projectRoot, obj.script)
      .replace(/\\/g, "/"),
  }));

  return {
    ...conf,
    absTestFolder: path.relative(projectConf.projectRoot, conf.absTestFolder).replace(/\\/g, "/"), // prettier-ignore
    absTestLogFolder: path.relative(projectConf.projectRoot, conf.absTestLogFolder).replace(/\\/g, "/"), // prettier-ignore
    projectRoot: path.relative(projectConf.projectRoot, conf.projectRoot).replace(/\\/g, "/"), // prettier-ignore
    scriptFolders,
    scripts,
  };
};
