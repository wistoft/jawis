import fs from "fs";
import path from "path";

export type ScriptDefinition = {
  script: string;
  autoStart?: boolean;
  autoRestart?: boolean;
};

/**
 *
 */
export const loadScripts = (folders?: string[]) => {
  if (!folders) {
    return [];
  }

  let script = [] as string[];

  folders.forEach((folder) => {
    const scriptFiles = fs
      .readdirSync(folder)
      .map((file) => path.join(folder, file))
      .filter(
        (file) =>
          fs.lstatSync(file).isFile() &&
          (file.endsWith(".js") || file.endsWith(".ts"))
      );

    script = script.concat(scriptFiles);
  });

  return mapScriptFilesToDefault(script);
};

/**
 *
 */
export const mapScriptFilesToDefault = (scripts: string[]) =>
  scripts.map(
    (script): ScriptDefinition => ({
      script,
      autoRestart: false,
    })
  );
