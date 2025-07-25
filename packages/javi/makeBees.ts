import fs from "node:fs";
import path from "node:path";
import { MakeBee } from "^bee-common";
import { StdProcess, StdioIpcProcess } from "^process-util";
import { ensureMkdirSync } from "^jab-node";
import { err } from "^jab";

const defaultWinPath = `${process.env.SYSTEMROOT}\\system32;${process.env.SYSTEMROOT};${process.env.SYSTEMROOT}\\System32\\Wbem;${process.env.SYSTEMROOT}\\System32\\WindowsPowerShell\\v1.0\\;`;

/**
 *
 *  - Need to put default window path in front, because mingw has binaries, that shadow the cmd.exe binaries.
 *
 */
export const makeCommandBee: MakeBee = (deps) => {
  if (deps.def.data) {
    if (
      typeof deps.def.data !== "object" ||
      Object.keys(deps.def.data).length !== 0
    ) {
      console.log("makeCommandBee: data not impl", deps.def.data);
    }
  }

  if (deps.def.next) {
    throw new Error("next not impl");
  }

  return new StdProcess({
    ...deps,
    filename: deps.def.filename,
    env: {
      ...process.env,
      PATH: defaultWinPath + process.env.PATH,
    },
  });
};

/**
 *
 */
export const makePowerBee: MakeBee = (deps) => {
  if (deps.def.data) {
    if (
      typeof deps.def.data !== "object" ||
      Object.keys(deps.def.data).length !== 0
    ) {
      console.log("makePowerBee: data not impl", deps.def.data);
    }
  }

  if (deps.def.next) {
    throw new Error("next not impl");
  }

  return new StdProcess({
    ...deps,
    filename: "powershell.exe",
    args: [deps.def.filename],
  });
};

/**
 * hacky
 *
 * todo
 *  - stdio channel
 *  - send errors from ErrorHandler
 *  - capture values
 *  - out-function
 *
 * note
 *  - The exit status of Run is not the exit status of the compiled binary.
 */
export const makeGoBee: MakeBee = (deps) => {
  if (deps.def.data) {
    if (
      typeof deps.def.data !== "object" ||
      Object.keys(deps.def.data).length !== 0
    ) {
      console.log("makeGoBee: data not impl", deps.def.data);
    }
  }

  if (deps.def.next) {
    throw new Error("next not impl");
  }

  //
  // conf
  //

  const tempFolder = "/tmp/go-tmp-booter";
  const rootFolder = __dirname; //extract by locating go.mod
  const rootModule = "gob"; //extract from go.mod

  const relScriptFolder = path
    .dirname(path.relative(rootFolder, deps.def.filename))
    .replace(/\\/g, "/");

  //
  // get name of main function
  //

  const str = fs.readFileSync(deps.def.filename).toString();

  const match = str.match(/func\s+(Main[^(]*)\(/);

  if (!match) {
    throw err("Could not find name of main-function", {
      filename: deps.def.filename,
    });
  }

  const mainFuncName = match[1]; //first submatch.

  //
  // write booter module
  //

  ensureMkdirSync(tempFolder);

  fs.copyFileSync(
    path.join(__dirname, "ErrorHandler.go"),
    path.join(tempFolder, "ErrorHandler.go")
  );

  fs.writeFileSync(
    path.join(tempFolder, "/go.mod"),
    `
module booter
go 1.21.3
require gob v0.0.0
replace gob v0.0.0 => ${rootFolder}
`
  );

  fs.writeFileSync(
    path.join(tempFolder, "/main.go"),
    `
package main
import ( script_pkg "${rootModule}/${relScriptFolder}" )
func main() {
  defer ErrorHandler()
  script_pkg.${mainFuncName}()
}
`
  );

  //start

  return new StdProcess({
    ...deps,
    filename: "go",
    args: ["run", "."],
    cwd: tempFolder,
  });
};
