import path from "node:path";
import fs from "node:fs";

import {
  tryProp,
  isString,
  isInt,
  isArray,
  isObject,
  isBoolean,
  assert,
} from "^jab";
import { makeAbsolute } from "^jab-node";
import { makeUserMessage } from "^main-wrapper";
import { ScriptDefinition } from "^jagos";

import { FullJaviConf, getTestFrameworkConf } from "./internal";

/**
 * Read javi config file from disk.
 *
 * - When no config file use default values.
 * - projectRoot: just the place as config file.
 * - When known errors throw a UserMessage exception.
 */
export const getJaviConf = (
  confFileDir: string,
  platform: string,
  confFileName = "javi.conf"
): FullJaviConf => {
  const confFile = path.join(confFileDir, confFileName);

  //load

  let conf;

  try {
    conf = eval("require.eager || require")(confFile);
  } catch (e) {
    if (tryProp(e, "code") === "MODULE_NOT_FOUND") {
      conf = {}; // use nothing, when no conf file is found.
    } else {
      throw e;
    }
  }

  //handle

  if (!isObject(conf)) {
    throw makeUserMessage( "Javi: config file must export an object. Exported: " + typeof conf ); // prettier-ignore
  }

  if ("default" in conf) {
    conf = conf.default; //support export default.

    if (!isObject(conf)) {
      throw makeUserMessage( "Javi: config file must default export an object. Exported: " + typeof conf ); // prettier-ignore
    }
  }

  return getFullConf(conf, confFileDir, platform);
};

/**
 * Fill out the end-user conf to be useful for javi.
 *
 * - the conf file schema is implicitly defined by the functions.
 * - throw if folders doesn't exist.
 *    - except test logs folder. It will be created lazily, when accepting test logs.
 *
 * default
 *  testFolder is conf dir
 *  scriptFolder is conf dir
 */
export const getFullConf = (
  inConf: { [_: string]: unknown },
  confFileDir: string,
  platform: string,
  onlyBasenameInErrors = false //for testing
): FullJaviConf => {
  assert(path.isAbsolute(confFileDir), "confFileDir must be absolute, was: " + confFileDir ); // prettier-ignore

  const conf = { ...inConf };

  //siteTitle

  let siteTitle = "Javi";

  if (conf.siteTitle !== undefined) {
    siteTitle = a(conf.siteTitle, isString, "Javi: siteTitle must be string, was: " + conf.siteTitle ); // prettier-ignore
  }

  delete conf.siteTitle;

  //port

  let port = 3003;

  if (conf.port !== undefined) {
    port = a(conf.port, isInt, "Javi: port must be integer, was: " + conf.port);
  }

  delete conf.port;

  //removePathPrefix

  let removePathPrefix = "";

  if (conf.removePathPrefix !== undefined) {
    removePathPrefix = a(conf.removePathPrefix, isString, "Javi: removePathPrefix must be string, was: " + conf.removePathPrefix); // prettier-ignore
  }

  delete conf.removePathPrefix;

  //phpBinary

  let phpBinary = "php";

  if (conf.phpBinary !== undefined) {
    phpBinary =  a(conf.phpBinary, isString, "Javi: phpBinary must be string, was: " + conf.phpBinary); // prettier-ignore
  }

  delete conf.phpBinary;

  //vsCodeBinary

  let vsCodeBinary =
    platform === "linux"
      ? "code"
      : "C:\\Program Files\\Microsoft VS Code\\Code.exe";

  if (conf.vsCodeBinary !== undefined) {
    vsCodeBinary =  a(conf.vsCodeBinary, isString, "Javi: vsCodeBinary must be string, was: " + conf.vsCodeBinary); // prettier-ignore
  }

  delete conf.vsCodeBinary;

  //winMergeBinary

  let winMergeBinary =
    platform === "linux"
      ? "/mnt/c/Program Files (x86)/WinMerge/WinMergeU.exe"
      : "C:\\Program Files (x86)\\WinMerge\\WinMergeU.exe";

  if (conf.winMergeBinary !== undefined) {
    winMergeBinary =  a(conf.winMergeBinary, isString, "Javi: winMergeBinary must be string, was: " + conf.winMergeBinary); // prettier-ignore
  }

  delete conf.winMergeBinary;

  //test folder

  let absTestFolder = confFileDir;

  if (conf.testFolder !== undefined) {
    const testFolder = a(conf.testFolder, isString, "Javi: testFolder must be string, was: " + conf.testFolder); // prettier-ignore
    absTestFolder = makeAbsolute(confFileDir, testFolder);
  }

  if (!fs.existsSync(absTestFolder)) {
    const file = onlyBasenameInErrors
      ? path.basename(absTestFolder)
      : absTestFolder;
    throw makeUserMessage( "Javi: testFolder must exist: " + file ); // prettier-ignore
  }

  delete conf.testFolder;

  //test log folder

  let absTestLogFolder = path.join(absTestFolder, "_testLogs");

  if (conf.testLogFolder !== undefined) {
    const testLogFolder = a(conf.testLogFolder, isString, "Javi: testLogFolder must be string, was: " + conf.testLogFolder); // prettier-ignore
    absTestLogFolder = makeAbsolute(absTestFolder, testLogFolder);
  }

  delete conf.testLogFolder;

  //tecTimeout

  let tecTimeout = 30000;

  if (conf.tecTimeout !== undefined) {
    tecTimeout = a(conf.tecTimeout, isInt, "Javi: tecTimeout must be number, was: " + conf.tecTimeout); // prettier-ignore
  }

  delete conf.tecTimeout;

  //scriptFolders

  let scriptFolders: string[] = [confFileDir];

  if (conf.scriptFolders !== undefined) {
    const relativeScriptFolders = a(conf.scriptFolders, isArray, "Javi: scriptFolders must be array, was: " + conf.scriptFolders ) as unknown[]; // prettier-ignore

    scriptFolders = relativeScriptFolders.map((folder, index) => {
      const file = makeAbsolute(
        confFileDir,
        a(folder, isString, "Javi: scriptFolders[" + index + "] must be string, was: " + folder ) // prettier-ignore
      );

      if (!fs.existsSync(file)) {
        const fileForError = onlyBasenameInErrors ? path.basename(file) : file;

        throw makeUserMessage( "Javi: scriptFolders[" + index + "] must exist: " + fileForError ); // prettier-ignore
      }

      return file;
    });
  }

  delete conf.scriptFolders;

  //scripts

  let scripts: ScriptDefinition[] = [];

  if (conf.scripts !== undefined) {
    const relativeScripts = a(conf.scripts, isArray, "Javi: scripts must be array, was: " + conf.scripts ) as unknown[]; // prettier-ignore

    scripts = relativeScripts.map((def, index) => {
      const prefix = "Javi: scripts[" + index + "]";

      if (!isObject(def)) {
        throw makeUserMessage( prefix + " must be object, was: " + def ); // prettier-ignore
      }

      const res: ScriptDefinition = {
        script: makeAbsolute(confFileDir, a(def.script, isString, prefix + ".script must be string, was: " + def.script)), // prettier-ignore
      };

      if (def.autoStart !== undefined) {
        res.autoStart = a( def.autoStart,  isBoolean, prefix + ".autoStart must be boolean, was: " + def.autoStart ); // prettier-ignore
      }

      if (def.autoRestart !== undefined) {
        res.autoRestart = a( def.autoRestart,  isBoolean, prefix + ".autoRestart must be boolean, was: " + def.autoRestart ); // prettier-ignore
      }

      if (!fs.existsSync(res.script)) {
        const fileForError = onlyBasenameInErrors
          ? path.basename(res.script)
          : res.script;

        throw makeUserMessage(prefix + " must exist: " + fileForError);
      }

      return res;
    });
  }

  delete conf.scripts;

  //service-conf

  let serviceConf = {};

  if (conf.serviceConf !== undefined) {
    serviceConf =  a(conf.serviceConf, isObject, "Javi: serviceConf must be object, was: " + conf.serviceConf); // prettier-ignore
  }

  delete conf.serviceConf;

  //test framework

  const testFrameworks = getTestFrameworkConf(
    conf.testFrameworks as any,
    confFileDir,
    phpBinary,
    onlyBasenameInErrors
  );

  delete conf.testFrameworks;

  // warn about unknown properties

  Object.keys(conf).map((key) =>
    console.log("Javi: Unknown configuration: " + key)
  );

  //return

  return {
    siteTitle,
    port,
    removePathPrefix,
    phpBinary,
    vsCodeBinary,
    winMergeBinary,

    //unconfigurable
    projectRoot: confFileDir,
    initialShowSystemFrames: false,
    showClearLink: true,

    //jate
    absTestFolder,
    absTestLogFolder,
    tecTimeout,

    //jago
    scriptFolders,
    scripts,

    serviceConf,

    testFrameworks,
  };
};

/**
 * - In order to be able to throw UserMesage
 */
export const a = <T>(
  value: unknown,
  predicate: (value: unknown) => value is T,
  msg: string
) => {
  if (predicate(value)) {
    return value;
  }

  throw makeUserMessage(msg);
};
