import path from "path";
import fs from "fs";

import fse from "fs-extra";

/**
 * - ensure it exists, because it might get deleted.
 */
export const getScratchPath = (script?: string) => {
  const folder = path.join(__dirname, "../scratchFolder");

  fse.ensureDir(folder);

  return path.join(folder, script || "");
};

/**
 *
 */
export const emptyScratchFolder = () => fse.emptyDirSync(getScratchPath());

/**
 *
 */
export const writeScriptFileThatChanges2 = (value: number) => {
  writeScriptFileThatChanges(value, "FileThatChanges2.js");
};

/**
 *
 */
export const writeScriptFileThatChanges = (
  value: number,
  name = "FileThatChanges.js"
) => {
  const code = "module.exports = " + value + ";";
  fs.writeFileSync(getScratchPath(name), code);
};
