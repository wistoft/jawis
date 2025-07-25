import { FullJaviConf } from "^javi/internal";

import { filterAbsoluteFilepath } from ".";

/**
 *
 */
export const filterConfig = (conf: FullJaviConf) => {
  const scriptFolders = conf.scriptFolders.map((str) =>
    filterAbsoluteFilepath(str)
  );

  const scripts = conf.scripts.map((obj) => ({
    ...obj,
    script: filterAbsoluteFilepath(obj.script),
  }));

  if (conf.testFrameworks.phpunit?.absFolders) {
    conf.testFrameworks.phpunit.absFolders =
      conf.testFrameworks.phpunit.absFolders.map(filterAbsoluteFilepath);
  }

  return {
    ...conf,
    absTestFolder: filterAbsoluteFilepath(conf.absTestFolder),
    absTestLogFolder: filterAbsoluteFilepath(conf.absTestLogFolder),
    projectRoot: filterAbsoluteFilepath(conf.projectRoot),
    scriptFolders,
    scripts,
  };
};
