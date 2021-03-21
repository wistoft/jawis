import path from "path";

import { tryProp, assertArray, assertInt, assertString } from "^jab";
import { nodeRequire, UserMessage } from "^jab-node";
import { ScriptDefinition } from "^jagos";

export type JaviConfResolved = {
  port: number;
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;

  //jate
  absTestFolder: string;
  absTestLogFolder: string;

  //jago
  scriptFolders: string[];
  scripts: ScriptDefinition[];
};

/**
 * Read javi config file from disk.
 *
 * - hacky implemented
 * - projectRoot: default value is the same place as config file.
 */
export const getJaviConf = (confFileDir: string): JaviConfResolved => {
  const confFileName = "javi.conf";
  const confFile = path.join(confFileDir, confFileName);

  try {
    nodeRequire.resolve(confFile);
  } catch (any) {
    const e = any as unknown;

    const code = tryProp(e, "code");
    if (code === "MODULE_NOT_FOUND") {
      throw new UserMessage("Javi: config file not found: " + confFile);
    } else {
      throw e;
    }
  }

  //load

  let any = nodeRequire(confFile);

  if ("default" in any) {
    any = any.default; //support export default.
  }

  //test folder

  const testFolder = assertString(
    any.testFolder,
    "JaviConf: testFolder must be string: " + any.testFolder
  );

  const absTestFolder = path.join(confFileDir, testFolder);

  //test log folder

  let testLogFolder = path.join(testFolder, "_testLogs");

  if (any.testLogFolder) {
    testLogFolder = assertString(
      any.testLogFolder,
      "JaviConf: testLogFolder must be string: " + any.testLogFolder
    );
  }

  const absTestLogFolder = path.join(confFileDir, testLogFolder);

  //port

  let port = 3003;

  if (any.port) {
    port = assertInt(any.port, "JaviConf: port must be integer: " + any.port);
  }

  //removePathPrefix

  let removePathPrefix = "";

  if (any.removePathPrefix) {
    removePathPrefix = assertString(
      any.removePathPrefix,
      "JaviConf: removePathPrefix must be string: " + any.removePathPrefix
    );
  }

  //scriptFolders

  let scriptFolders: string[] = [];

  if (any.scriptFolders) {
    const relativeScriptFolders = assertArray(
      any.scriptFolders,
      "JaviConf: scriptFolders must be array: " + any.scriptFolders
    ) as string[];

    scriptFolders = relativeScriptFolders.map((folder) =>
      path.join(confFileDir, folder)
    );
  }

  //scripts

  let scripts: ScriptDefinition[] = [];

  if (any.scripts) {
    const relativeScripts = assertArray(
      any.scripts,
      "JaviConf: scripts must be array: " + any.scripts
    ) as ScriptDefinition[];

    scripts = relativeScripts.map((def) => ({
      ...def,
      script: path.join(confFileDir, def.script),
    }));
  }

  //return

  return {
    port,
    projectRoot: confFileDir,
    removePathPrefix,
    initialShowSystemFrames: false,
    showClearLink: true,
    absTestFolder,
    absTestLogFolder,
    scriptFolders,
    scripts,
  };
};
