import fs from "fs";
import { def, err, JabError, tos } from "^jab";
import path from "path";
import ts, { Diagnostic, DiagnosticMessageChain, MapLike } from "typescript";

export type TsConfigPaths = {
  absBaseUrl?: string;
  paths?: MapLike<string[]>;
};

/**
 * Returns the config file matching the directory.
 */
export function getAbsConfigFilePath(mainScriptDirname: string) {
  const absConfigFilePath = ts.findConfigFile(
    mainScriptDirname,
    ts.sys.fileExists
  );

  if (!absConfigFilePath) {
    throw new Error("Could not locate ts config: " + mainScriptDirname);
  }

  return absConfigFilePath;
}

/**
 * Reads the given config file.
 */
export function getTsConfigFromAbsConfigFile(absConfigFilePath: string) {
  const projectRoot = path.dirname(absConfigFilePath);

  const confResult = ts.readConfigFile(absConfigFilePath, ts.sys.readFile);

  if (confResult.error) {
    throw new JabError(
      "Error reading ts config file: " + dianosticToString(confResult.error),
      tos(confResult.error)
    );
  }

  const parsed = ts.parseJsonConfigFileContent(
    confResult.config,
    ts.sys,
    projectRoot
  );

  if (parsed.errors && parsed.errors.length > 0) {
    throw new JabError(
      "Could not parse tsconfig.json: " + dianosticToString(parsed.errors),
      tos(parsed.errors)
    );
  }

  return parsed.options;
}

/**
 *
 * todo
 *  use getLineAndCharacterOfPosition to make a link to position.
 */
export function dianosticToString(
  diag: Diagnostic | readonly Diagnostic[]
): string {
  if (Array.isArray(diag)) {
    return diag.reduce((acc, cur) => dianosticToString(cur) + "\n", "");
  } else {
    const d: Diagnostic = diag as Diagnostic; //typescript can't always detect it's not an array.

    if (typeof d.messageText === "string") {
      return d.messageText;
    } else {
      return dianosticChainToString(d.messageText);
    }
  }
}

/**
 *
 */
export function dianosticChainToString(diag: DiagnosticMessageChain): string {
  let chain = "";

  if (diag.next) {
    let level = 0;
    for (const val of diag.next) {
      level++;
      chain += "\n" + "\t".repeat(level) + dianosticChainToString(val);
    }
  }

  return diag.messageText + chain;
}

/**
 * Checks the path-info.
 *
 */
export const getRelevantConfig = (
  compilerOptions: ts.CompilerOptions,
  absConfigFilePath: string
): TsConfigPaths => {
  if (!fs.existsSync(absConfigFilePath)) {
    err("Jacs: config file must exist: ", absConfigFilePath);
  }

  if (!("baseUrl" in compilerOptions)) {
    err("quick fix: tsconfig file must contain baseUrl: ", absConfigFilePath);
  }

  if (!("paths" in compilerOptions)) {
    err("quick fix: tsconfig file must contain paths: ", absConfigFilePath);
  }

  const projectRoot = path.dirname(absConfigFilePath);

  //make conf for tsconfig-paths absolute, so it doesn't do any magic. Maybe unneeded.

  const absBaseUrl = path.resolve(projectRoot, def(compilerOptions.baseUrl));

  if (!fs.existsSync(absBaseUrl)) {
    err("Jacs: BaseUrl must exist:", absBaseUrl);
  }

  //Give some debugging info.

  const absPaths: {
    [_: string]: string[];
  } = {};

  for (const pathEntry in compilerOptions.paths) {
    const relReplaceArray = compilerOptions.paths[pathEntry];

    //map each path

    const absReplaceArray = relReplaceArray.map((rel) => {
      const abs = path.resolve(absBaseUrl, rel);

      //verify that paths without wildcard exist.

      //  maybe also check with * set to empty string. That should exist too.

      if (!pathEntry.includes("*")) {
        if (!fs.existsSync(abs)) {
          console.log(
            "Jacs: The path replacement does not exist:",
            pathEntry,
            abs
          );
        }
      }

      //return

      return abs;
    });

    //store

    absPaths[pathEntry] = absReplaceArray;
  }

  //return

  return {
    absBaseUrl,
    paths: compilerOptions.paths,
  };
};
