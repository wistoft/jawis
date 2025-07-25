import path from "node:path";
import { MakeBee } from "^bee-common";
import {
  exec,
  SimpleExec,
  StdioIpcProcess,
  StdioIpcProcessDeps,
} from "^process-util";

/**
 *
 * - makePhpProcess has more functionality, so it can be used to make bees.
 */
export const makePhpBee: MakeBee = (deps) =>
  makePhpProcess({ ...deps, filename: deps.def.filename }, deps.def.data);

/**
 *
 */
export const makePhpProcess = (
  deps: StdioIpcProcessDeps<any>,
  data?: unknown
) =>
  new StdioIpcProcess<any, any>({
    ...deps,
    filename: "php",
    env: {
      ...deps.env,
      PHP_BEE_BOOTER: JSON.stringify({
        beeFilename: deps.filename,
        data,
      }),
    },
    args: [path.join(__dirname, "PhpBeeBooter.php"), ...(deps.args ?? [])],
  });

/**
 *
 */
export const makeExecPhp =
  (phpBinary: string): SimpleExec =>
  (filename: string, args?: string[], cwd?: string) =>
    exec(phpBinary, [filename, ...(args || [])], {
      cwd,
    });
