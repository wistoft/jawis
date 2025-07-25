import fs from "node:fs";
import path from "node:path";

import * as projectConf from "../../project.conf";
import {
  copyFilesToFlatSync,
  copyFolderRecursively,
  listFilesRecursiveSync,
  makeAbsolute,
  mapFolder,
} from "^jab-node";
import { assert } from "^jab";

/**
 *
 */
export const buildPhpFilesSync = (deps: {
  packageName: string;
  buildFolder: string;
  keepSubFoldersInNodeBeesAndPlainFiles: boolean;
}) => copyExtraFilesSync(".php", deps);

/**
 *
 */
export const copyExtraFilesSync = (
  fileExtension: string,
  deps: {
    packageName: string;
    buildFolder: string;
    keepSubFoldersInNodeBeesAndPlainFiles: boolean;
  }
) => {
  assert(fileExtension.includes("."));

  const all = listFilesRecursiveSync(
    makeAbsolute(projectConf.packageFolder, deps.packageName)
  );

  const files = all.filter((file) => file.endsWith(fileExtension));

  const outPath = deps.keepSubFoldersInNodeBeesAndPlainFiles
    ? path.join(deps.buildFolder, deps.packageName)
    : path.join(deps.buildFolder);

  copyFilesToFlatSync(files, outPath);
};

/**
 *
 */
export const buildPhasic = async (deps: { buildFolder: string }) =>
  copyFolderRecursively(
    path.join(projectConf.packageFolder, "phasic"),
    path.join(deps.buildFolder, "wiph/phasic")
  );

/**
 *
 */
export const convertPhpFilesInBuildFolder = async (deps: {
  buildFolder: string;
}) =>
  mapFolder(deps.buildFolder + "/**/*.php", (content: string) =>
    content.replace(/wiph_dev\\/g, "wiph\\")
  );

/**
 * Ensures individual php packages can load wiph.
 *
 * hacky.
 *  - The position of buildFolder is hardcoded
 *  - All files must be in same depth from buildFolder
 *  - All files should be manually added here.
 */
export const dumpAutoloadFiles = async (deps: { buildFolder: string }) =>
  fs.promises.writeFile(
    path.join(deps.buildFolder, "bee-php/autoload.php"),
    `<?php
require_once __DIR__ . "/../autoload.php";
`
  );

/**
 *
 */
export const dumpAutoloadFile = async (deps: { buildFolder: string }) =>
  fs.promises.writeFile(
    path.join(deps.buildFolder, "autoload.php"),
    `<?php
spl_autoload_register(function ($class) {
  if (!preg_match('/^wiph/', $class)){
	  return;
  }

  $file = str_replace('\\\\', DIRECTORY_SEPARATOR, $class).'.php';
  $file = __DIR__ . DIRECTORY_SEPARATOR . $file;
  if (file_exists($file)) {
      require $file;
      return true;
  }
  return false;
});
`
  );
