import { FullJaviConf } from "^javi/types";
import { filterFilepath } from ".";

/**
 *
 */
export const filterConfig = (conf: FullJaviConf) => {
  const scriptFolders = conf.scriptFolders.map((str) => filterFilepath(str));

  const scripts = conf.scripts.map((obj) => ({
    ...obj,
    script: filterFilepath(obj.script),
  }));

  return {
    ...conf,
    absTestFolder: filterFilepath(conf.absTestFolder),
    absTestLogFolder: filterFilepath(conf.absTestLogFolder),
    projectRoot: filterFilepath(conf.projectRoot),
    scriptFolders,
    scripts,
  };
};
