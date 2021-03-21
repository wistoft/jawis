import fs, { PathLike } from "fs";
import path from "path";

import { assertString, undefinedOr, isInt } from "^jab";

import { execSilent, execSyncAndGetStdout } from "^jab-node";

/**
 *
 */
export const openFileInVsCode = (file: string, line?: number) => {
  let fileSpec = file;

  if (line) {
    fileSpec += ":" + line;
  }

  const stdoutNoisy = execSyncAndGetStdout(
    "C:\\Program Files\\Microsoft VS Code\\Code.exe",
    ["-g", fileSpec]
  );

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
export const handleOpenFileInVsCode = (
  msg: {
    file: string;
    line?: number;
  },
  baseFolder = ""
) => {
  const file = assertString(msg.file);
  const line = undefinedOr(isInt)(msg.line);
  openFileInVsCode(path.join(baseFolder, file), line);
};

/**
 *
 */
export const compareFiles = (file1: string, file2: string) =>
  execSilent("C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe", [
    file1,
    file2,
  ]);
