import path from "node:path";
import fs from "node:fs";

import { isString, isArray, isObject, assert } from "^jab";
import { makeAbsolute } from "^jab-node";
import { makeUserMessage } from "^main-wrapper";

import { a } from "./internal";

export type TestFrameworkDefinitionNew = {
  phpunit?: {
    absFolders: string[];
    phpBinary: string;
  };
};

/**
 *
 */
export const getTestFrameworkConf = (
  inConf: { [_: string]: unknown } | undefined,
  confFileDir: string,
  inheritedPhpBinary: string,
  onlyBasenameInErrors = false //for testing
): TestFrameworkDefinitionNew => {
  assert(path.isAbsolute(confFileDir), "confFileDir must be absolute, was: " + confFileDir ); // prettier-ignore

  const conf = { ...inConf };

  if (conf === undefined) {
    return {};
  }

  //phpunit

  let phpunit: TestFrameworkDefinitionNew["phpunit"] = undefined;

  if (conf.phpunit !== undefined) {
    const raw = a(conf.phpunit, isObject, "Javi: phpunit must be an object, was: " + conf.phpunit); // prettier-ignore

    //absFolders

    const relativeFolders = a(raw.folders, isArray, "Javi: phpunit.folders must be array, was: " + raw.folders ) as unknown[]; // prettier-ignore

    const absFolders = relativeFolders.map((folder, index) => {
      const file = makeAbsolute(
        confFileDir,
        a(folder, isString, "Javi: phpunit.folders[" + index + "] must be string, was: " + folder ) // prettier-ignore
      );

      if (!fs.existsSync(file)) {
        const fileForError = onlyBasenameInErrors ? path.basename(file) : file;

        throw makeUserMessage( "Javi: phpunit.folders[" + index + "] must exist: " + fileForError ); // prettier-ignore
      }

      return file;
    });

    //phpBinary

    let phpBinary = inheritedPhpBinary;

    if (raw.phpBinary !== undefined) {
      phpBinary =  a(raw.phpBinary, isString, "Javi: phpunit.phpBinary must be string, was: " + raw.phpBinary); // prettier-ignore
    }

    //done

    phpunit = { absFolders, phpBinary };
  }

  delete conf.phpunit;

  return {
    phpunit,
  };
};
