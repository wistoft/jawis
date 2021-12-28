import fs from "fs";
import path from "path";

import { assertString, undefinedOr, isInt, assert } from "^jab";

import { execAndGetStdout, execSilent, getParentFolders } from "^jab-node";

export type HandleOpenFileInEditor = (
  location: {
    file: string;
    line?: number;
  },
  baseFolder?: string
) => void;

export type CompareFiles = (file1: string, file2: string) => void;

export type FileService = {
  handleOpenFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
};

/**
 *
 */
export const openFileInVsCode = async (
  vsCodeBinary: string,
  file: string,
  line?: number
) => {
  let fileSpec = file;

  if (line) {
    fileSpec += ":" + line;
  }

  const stdoutNoisy = await execAndGetStdout(vsCodeBinary, ["-g", fileSpec]);

  //this doesn't filter exceptions in `execSyncAndGetStdout`
  const stdout = stdoutNoisy
    .replace(
      "(electron) Sending uncompressed crash reports is deprecated and will be removed in a future version of Electron. Set { compress: true } to opt-in to the new behavior. Crash reports will be uploaded gzipped, which most crash reporting servers support.",
      ""
    )
    .trim();

  if (stdout !== "") {
    //the information that `execSyncAndGetStdout` gives isn't presented here.
    throw new Error("Message from vs code: " + JSON.stringify(stdout));
  }
};

/**
 *
 */
export const makeHandleOpenFileInVsCode = (
  vsCodeBinary: string
): HandleOpenFileInEditor => (
  location: {
    file: string;
    line?: number;
  },
  baseFolder = ""
) => {
  const file = assertString(location.file);
  const line = undefinedOr(isInt)(location.line);
  const fullpath = path.join(baseFolder, file);

  assert(fs.existsSync(fullpath), "File not found: ", fullpath);

  openFileInVsCode(vsCodeBinary, fullpath, line);
};

/**
 *
 */
export const makeCompareFiles = (binary: string): CompareFiles => (
  file1: string,
  file2: string
) => execSilent(binary, [file1, file2]);

/**
 *
 * code duplicated with sshBooter.js
 * bug: what about chunks containing multiple nul-bytes.
 */
export const makeOnJsonOverStdout = (onMessage: (json: string) => void) => {
  let inputBuffer = "";

  return (data: Buffer) => {
    inputBuffer += data;

    const pos = inputBuffer.indexOf("\x00");

    if (pos !== -1) {
      const json = inputBuffer.slice(0, pos);
      onMessage(JSON.parse(json));

      inputBuffer = inputBuffer.slice(pos + 1);
    }
  };
};

/**
 * Returns nearest project.json, if it exists.
 */
export const locateProjectJson = (startingFolder: string) => {
  for (const folder of getParentFolders(startingFolder)) {
    const file = path.join(folder, "package.json");
    if (fs.existsSync(file)) {
      return file;
    }
  }
};
