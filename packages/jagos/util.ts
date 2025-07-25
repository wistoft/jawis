import fs from "node:fs";
import path from "node:path";

import { HoneyComb } from "^bee-common";
import { AbsoluteFile, MainFileDeclaration } from "^jab";

import { ScriptDefinition } from "./internal";

export const scriptWrapperMainDeclaration: MainFileDeclaration = {
  type: "node-bee",
  file: "ScriptWrapperMain",
  folder: __dirname,
};

/**
 *
 */
export const loadScriptFolders = (
  honeyComb?: HoneyComb<any>,
  folders?: string[]
) => {
  if (!folders) {
    return [];
  }

  let scripts: ScriptDefinition[] = [];

  folders.forEach((folder) => {
    scripts = scripts.concat(
      fs
        .readdirSync(folder)
        .map(
          (file): ScriptDefinition => ({
            script: path.join(folder, file) as AbsoluteFile,
          })
        )
        .filter(
          ({ script }) =>
            fs.lstatSync(script).isFile() &&
            (script.endsWith(".js") ||
              script.endsWith(".ts") ||
              honeyComb?.isBee(script))
        )
    );
  });

  return scripts;
};
