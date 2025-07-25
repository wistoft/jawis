import fs from "node:fs";
import path, { basename } from "node:path";
import fse from "fs-extra";
import fastGlob from "fast-glob";
import readdirRecursive from "fs-readdir-recursive";

import { AbsoluteFile } from "^jab";
import { assertAbsolute } from "./internal";

/**
 *
 */
export const getFileOrEmpty = async (file: string) => {
  if (await fse.pathExists(file)) {
    return (await fs.promises.readFile(file)).toString();
  } else {
    return "";
  }
};

/**
 *
 *  - todo: determine if they're directories async.
 */
export const listFilesNonRecursive = async (folder: string) => {
  const nodes = await fs.promises.readdir(folder);

  return nodes
    .map((relFile) => path.join(folder, relFile) as AbsoluteFile)
    .filter((file) => !fs.lstatSync(file).isDirectory());
};

/**
 *
 */
export const listFilesRecursiveSync = (folder: AbsoluteFile) => {
  assertAbsolute(folder);
  return readdirRecursive(folder).map(
    (relFile: string) => path.join(folder, relFile) as AbsoluteFile
  );
};

/**
 *
 *  - todo: determine if it's directories async.
 */
export const listFoldersNonRecursive = async (folder: string) => {
  const nodes = await fs.promises.readdir(folder);

  return nodes
    .map((relFile) => path.join(folder, relFile))
    .filter((file) => fs.lstatSync(file).isDirectory());
};

/**
 * - files are relative to the source folder.
 */
export const copyFilesBetweenFoldersSync = (
  sourceFolder: string,
  targetFolder: string,
  files: string[]
) => {
  for (const file of files) {
    const sourceFile = path.join(sourceFolder, file);

    if (fs.existsSync(sourceFile)) {
      fs.copyFileSync(sourceFile, path.join(targetFolder, file));
    } else {
      console.log("File not found: " + sourceFile);
    }
  }
};

/**
 * - files must be absolute.
 * - files will not preserve their subpath.
 */
export const copyFilesToFlatSync = (files: string[], target: string) => {
  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(target, basename(file)));
    } else {
      throw new Error("File not found: " + file);
    }
  }
};

/**
 *
 * note
 *  - `fse.copy` can't copy folders non-recursively
 */
export const copyFolderNonRecursively = async (
  source: string,
  target: string
) => {
  const files = await listFilesNonRecursive(source);

  copyFilesToFlatSync(files, target);
};

/**
 *
 */
export const copyFolderRecursively = (source: string, target: string) =>
  fse.copy(source, target);

/**
 *
 */
export const ensureDeleted = (file: string) => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
};

/**
 *
 */
export const mapFolder = async (
  _pattern: string,
  mapper: (content: string) => string | undefined
) => {
  const pattern = _pattern.replace(/\\/g, "/"); //because fastglob can't handle backslash as folder separator

  const files = await fastGlob(pattern, { absolute: true });

  for (const file of files) {
    //read

    const content = (await fs.promises.readFile(file)).toString();

    //map

    const newContent = mapper(content);

    //write

    if (newContent !== undefined && newContent !== content) {
      await fs.promises.writeFile(file, newContent);
    }
  }
};
