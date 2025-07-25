import path from "node:path";
import { AbsoluteFile } from "^jab";
import { assertAbsolute } from "^jab-node";
import { getAbsoluteFilesInGit } from "^git-util";

import { PluginProv, ProjectFilesystemProv } from "./internal";

export type MakePluginDepsDeps = {
  rootFolder: string;
  projectFilesystem: ProjectFilesystemProv;
};

/**
 *
 */
export const makePluginDeps = (deps: MakePluginDepsDeps): PluginProv => {
  const getPackageJson = async (folder: AbsoluteFile) => {
    const file = path.join(folder, "package.json");

    const jsonStr = (await deps.projectFilesystem.readFile(file)).toString();

    const json = JSON.parse(jsonStr);

    return json;
  };

  return {
    rootFolder: assertAbsolute(deps.rootFolder),
    getAbsoluteFilesInGit: () => getAbsoluteFilesInGit(deps.rootFolder),
    getPackageJson,
    projectFilesystem: deps.projectFilesystem,
    ...deps.projectFilesystem,
  };
};
