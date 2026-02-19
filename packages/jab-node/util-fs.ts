import fs, { PathLike } from "node:fs";
import path, { basename, dirname } from "node:path";
import fse from "fs-extra";
import fastGlob from "fast-glob";
import readdirRecursive from "fs-readdir-recursive";
import os from "node:os";

import { AbsoluteFile, assert, CanonicalFile } from "^jab";

/**
 * Make the file absolute, if isn't already.
 */
export const makeAbsolute = (folder: string, file: string) => {
  if (path.isAbsolute(file)) {
    return file as AbsoluteFile;
  } else {
    return path.join(folder, file) as AbsoluteFile;
  }
};

/**
 *
 */
export const makeCanonical = (_file: AbsoluteFile) => {
  let file = _file.replace(/\\/g, "/");

  if (os.platform() === "win32") {
    file = file.toLowerCase();
  }

  return file as any as CanonicalFile;
};

/**
 *
 */
export const assertAbsolute = (file: string) => {
  assert(path.isAbsolute(file), "File must be absolute: " + file);

  return file as AbsoluteFile;
};

/**
 *
 */
export const ensureMkdirSync = (path: PathLike) => {
  let folders = getParentFolders(path.toString()).reverse();
  for (const folder of folders) {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder);
    }
  }
};

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
 */
export const listFoldersNonRecursive = async (folder: string) => {
  const nodes = await fs.promises.readdir(folder);

  return nodes
    .map((relFile) => path.join(folder, relFile))
    .filter((file) => fs.lstatSync(file).isDirectory());
};

/**
 * - Files are relative to the source folder.
 * - And will preserve the folders specified in the files array.
 */
export const copyFilesBetweenFoldersSync = (
  sourceFolder: string,
  targetFolder: string,
  files: string[]
) => {
  for (const file of files) {
    const sourceFile = path.join(sourceFolder, file);

    if (fs.existsSync(sourceFile)) {
      const targetFile = path.join(targetFolder, file);
      ensureMkdirSync(dirname(targetFile));
      fs.copyFileSync(sourceFile, targetFile);
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

/**
 * - Will include folder given as input.
 */
export const getParentFolders = (folder: string) => {
  const res: string[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    res.push(folder);

    if (folder == path.dirname(folder)) {
      break;
    }
    folder = path.dirname(folder);
  }

  return res;
};
