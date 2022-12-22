import fs from "fs";
import path from "path";
import ts, { Diagnostic, DiagnosticMessageChain, MapLike } from "typescript";
import { err, tos } from "^jab";

export type TsPathsConfig = {
  baseUrl: string;
  paths: MapLike<string[]>;
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
    err(
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
    err(
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
 *
 * - Make baseUrl absolute for ts-config-paths.
 * - Make some checks the configuration.
 */
export const getTsPathsConfig = (
  compilerOptions: ts.CompilerOptions,
  absConfigFilePath: string
): TsPathsConfig | undefined => {
  if (!fs.existsSync(absConfigFilePath)) {
    err("config file must exist: ", absConfigFilePath);
  }

  const projectRoot = path.dirname(absConfigFilePath);

  //make conf for tsconfig-paths absolute, so it doesn't do any magic. Maybe unneeded.

  const baseUrl = path.resolve(projectRoot, compilerOptions.baseUrl || "");

  if (!fs.existsSync(baseUrl)) {
    err("Jacs: BaseUrl must exist:", baseUrl);
  }

  //when no import aliases.

  if (compilerOptions.paths === undefined) {
    return;
  }

  //verify that paths without wildcard exist.

  for (const pathEntry in compilerOptions.paths) {
    for (const rel of compilerOptions.paths[pathEntry]) {
      if (!pathEntry.includes("*")) {
        const abs = path.resolve(baseUrl, rel);

        if (!fs.existsSync(abs)) {
          err( "Jacs: The path replacement does not exist:", pathEntry + " => " + abs ); // prettier-ignore
        }
      }
    }
  }

  //return

  return {
    baseUrl,
    paths: compilerOptions.paths,
  };
};
