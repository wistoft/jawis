import path from "path";
import fs from "fs";

import {
  tryProp,
  isString,
  isInt,
  isArray,
  isObject,
  isBoolean,
  assert,
} from "^jab";
import { nodeRequire, UserMessage } from "^jab-node";
import { ScriptDefinition } from "^jagos";

import { FullJaviConf } from "./types";

/**
 * Read javi config file from disk.
 *
 * - When no config file use default values.
 * - projectRoot: just the place as config file.
 * - When known errors throw a UserMessage exception.
 */
export const getJaviConf = (
  confFileDir: string,
  confFileName = "javi.conf"
): FullJaviConf => {
  const confFile = path.join(confFileDir, confFileName);

  //load

  let conf;

  try {
    conf = nodeRequire(confFile);
  } catch (e) {
    if (tryProp(e, "code") === "MODULE_NOT_FOUND") {
      conf = {}; // use nothing, when no conf file is found.
    } else {
      throw e;
    }
  }

  //handle

  // if (typeof conf !== "object") {
  if (!isObject(conf)) {
    throw new UserMessage( "Javi: config file must export an object. Exported: " + typeof conf ); // prettier-ignore
  }

  if ("default" in conf) {
    conf = conf.default; //support export default.

    if (!isObject(conf)) {
      throw new UserMessage( "Javi: config file must default export an object. Exported: " + typeof conf ); // prettier-ignore
    }
  }

  const fullConf = getFullConf(conf, confFileDir);

  if (typeof fullConf === "string") {
    throw new Error("not used, right.");
    // throw new UserMessage(fullConf);
  } else {
    return fullConf;
  }
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
  confFileDir: string
) => {
  assert(path.isAbsolute(confFileDir), "confFileDir must be absolute, was: " + confFileDir ); // prettier-ignore

  const conf = { ...inConf };

  //test folder

  let testFolder = "";

  if (conf.testFolder !== undefined) {
    testFolder = a(conf.testFolder, isString, "Javi: testFolder must be string, was: " + conf.testFolder); // prettier-ignore
  }

  const absTestFolder = path.join(confFileDir, testFolder);

  if (!fs.existsSync(absTestFolder)) {
    throw new UserMessage( "Javi: testFolder must exist: " + absTestFolder ); // prettier-ignore
  }

  delete conf.testFolder;

  //test log folder

  let testLogFolder = path.join(testFolder, "_testLogs");

  if (conf.testLogFolder !== undefined) {
    testLogFolder = a(conf.testLogFolder, isString, "Javi: testLogFolder must be string, was: " + conf.testLogFolder); // prettier-ignore
  }

  const absTestLogFolder = path.join(confFileDir, testLogFolder);

  delete conf.absTestLogFolder;

  //port

  let port = 3003;

  if (conf.port !== undefined) {
    port = a(conf.port, isInt, "Javi: port must be integer, was: " + conf.port);
  }

  delete conf.port;

  //tecTimeout

  let tecTimeout = 30000;

  if (conf.tecTimeout !== undefined) {
    tecTimeout = a(conf.tecTimeout, isInt, "Javi: tecTimeout must be number, was: " + conf.tecTimeout); // prettier-ignore
  }

  delete conf.tecTimeout;

  //removePathPrefix

  let removePathPrefix = "";

  if (conf.removePathPrefix !== undefined) {
    removePathPrefix = a(conf.removePathPrefix, isString, "Javi: removePathPrefix must be string, was: " + conf.removePathPrefix); // prettier-ignore
  }

  delete conf.removePathPrefix;

  //scriptFolders

  let scriptFolders: string[] = [confFileDir];

  if (conf.scriptFolders !== undefined) {
    const relativeScriptFolders = a(conf.scriptFolders, isArray, "Javi: scriptFolders must be array, was: " + conf.scriptFolders ) as unknown[]; // prettier-ignore

    scriptFolders = relativeScriptFolders.map((folder, index) => {
      const file = path.join(
        confFileDir,
        a(folder, isString, "Javi: scriptFolders[" + index + "] must be string, was: " + folder ) // prettier-ignore
      );

      if (!fs.existsSync(file)) {
        throw new UserMessage( "Javi: scriptFolders[" + index + "] must exist: " + file ); // prettier-ignore
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
        throw new UserMessage( prefix + " must be object, was: " + def ); // prettier-ignore
      }

      const res: ScriptDefinition = {
        script: path.join(confFileDir, a(def.script, isString, prefix + ".script must be string, was: " + def.script)), // prettier-ignore
      };

      if (def.autoStart !== undefined) {
        res.autoStart = a( def.autoStart,  isBoolean, prefix + ".autoStart must be boolean, was: " + def.autoStart ); // prettier-ignore
      }

      if (def.autoRestart !== undefined) {
        res.autoRestart = a( def.autoRestart,  isBoolean, prefix + ".autoRestart must be boolean, was: " + def.autoRestart ); // prettier-ignore
      }

      if (!fs.existsSync(res.script)) {
        throw new UserMessage(prefix + " must exist: " + res.script);
      }

      return res;
    });
  }

  delete conf.scripts;

  // warn about unknown properties

  Object.keys(conf).map((key) =>
    console.log("Javi: Unknown configuration: " + key)
  );

  //return

  return {
    port,
    projectRoot: confFileDir,
    tecTimeout,
    removePathPrefix,
    initialShowSystemFrames: false,
    showClearLink: true,
    absTestFolder,
    absTestLogFolder,
    scriptFolders,
    scripts,
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

  throw new UserMessage(msg);
};
