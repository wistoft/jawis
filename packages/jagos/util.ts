import fs from "fs";
import path from "path";
import { HoneyComb } from "^jab";

export type ScriptDefinition = {
  script: string;
  autoStart?: boolean;
  autoRestart?: boolean;
};

/**
 *
 */
export const loadScriptFolders = (
  honeyComb?: HoneyComb,
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
            script: path.join(folder, file),
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
