import { Serializable } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { FinallyFunc } from "^finally-provider";
import {
  NodeProcess,
  NodeProcessDeps,
  execAndGetStdout,
  execSilent,
} from "^process-util";
import { BeeRunner } from "^jarun";
import { MakeBee } from "^bee-common";
import {
  assertString,
  undefinedOr,
  isInt,
  assert,
  HandleOpenFileInEditor,
  CompareFiles,
} from "^jab";

/**
 *
 */
export type MakeJabProcess = <MR extends Serializable, MS extends Serializable>(
  deps: NodeProcessDeps<MR>
) => NodeProcess<MR, MS>;

/**
 *
 */
export const makeProcessRunner = (deps: {
  makeTsProcess: MakeJabProcess;
  finally: FinallyFunc;
}) => {
  const makeTsProcessConditionally = makeMakeTsJabProcessConditionally(
    deps.makeTsProcess
  );

  return new BeeRunner({
    ...deps,
    makeBee: makeTsProcessConditionally,
  });
};

/**
 *
 */
export const makeMakeTsJabProcessConditionally =
  (makeTsJabProcess: MakeJabProcess): MakeBee =>
  (deps) => {
    if (deps.def.data) {
      throw new Error("data not impl");
    }

    if (deps.def.next) {
      throw new Error("next not impl");
    }

    if (
      deps.def.filename.endsWith(".ts") ||
      deps.def.filename.endsWith(".tsx")
    ) {
      return makeTsJabProcess({ ...deps, filename: deps.def.filename });
    } else {
      return makeNodeProcessBee(deps);
    }
  };

/**
 *
 */
export const makeNodeProcessBee: MakeBee = (deps) => {
  if (deps.def.data) {
    throw new Error("data not impl");
  }

  if (deps.def.next) {
    throw new Error("next not impl");
  }

  return new NodeProcess({
    ...deps,
    filename: deps.def.filename,
  });
};

/**
 *
 */
export const makeTsNodeJabProcess: MakeJabProcess = (deps) => {
  if (deps.execArgv && deps.execArgv.length > 0) {
    throw new Error("not impl");
  }

  const tsNodeArgs = [
    "-r",
    "ts-node/register/transpile-only",
    "-r",
    "tsconfig-paths/register",
  ];

  const nodeArgs = [...tsNodeArgs];

  return new NodeProcess({
    ...deps,
    execArgv: nodeArgs,
    cwd: path.dirname(deps.filename),
  });
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

  const stdout = await execAndGetStdout(vsCodeBinary, [
    "--log",
    "off",
    "-g",
    fileSpec,
  ]);

  if (stdout.trim() !== "") {
    //the information that `execSyncAndGetStdout` gives isn't presented here.
    throw new Error("Message from vs code: " + stdout);
  }
};

/**
 *
 */
export const makeHandleOpenFileInVsCode =
  (vsCodeBinary: string): HandleOpenFileInEditor =>
  (
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
export const makeCompareFiles =
  (binary: string): CompareFiles =>
  (file1: string, file2: string) =>
    execSilent(binary, [file1, file2]);
