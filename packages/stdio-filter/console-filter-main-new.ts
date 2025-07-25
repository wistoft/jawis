import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";

import { makeStdioFilterNew } from "./internal";

//conf

// const timeout = 300;
const folder = __dirname;
const dataFolder = path.join(folder, "../console-filter");
const ignoreFile = path.join(dataFolder, "cf-ignore.txt");
const ignorePrefixFile = path.join(dataFolder, "cf-ignore-prefix.txt");
const allOutputFile = path.join(dataFolder, "cf-all.txt");
const shownOutputFile = path.join(dataFolder, "cf-shown.txt");
const includeJsonFile = path.join(dataFolder, "includeJson.js"); //could be implemented with includeLine
const includeLineFile = path.join(dataFolder, "includeLine.js");
const mapLineBeforeFilterFile = path.join(dataFolder, "mapLineBeforeFilter.js");
const mapLineBeforeOutputFile = path.join(dataFolder, "mapLineBeforeOutput.js");

//ensure folder and files

fse.ensureDirSync(dataFolder);
fse.ensureFileSync(ignoreFile);
fse.ensureFileSync(ignorePrefixFile);

//clear

fs.writeFileSync(allOutputFile, "");
fs.writeFileSync(shownOutputFile, "");

//load user functions

const includeLine = fs.existsSync(includeLineFile)
  ? eval("require")(includeLineFile)
  : undefined;

const includeJson = fs.existsSync(includeJsonFile)
  ? eval("require")(includeJsonFile)
  : undefined;

const mapLineBeforeFilter = fs.existsSync(mapLineBeforeFilterFile)
  ? eval("require")(mapLineBeforeFilterFile)
  : undefined;

const mapLineBeforeOutput = fs.existsSync(mapLineBeforeOutputFile)
  ? eval("require")(mapLineBeforeOutputFile)
  : undefined;

//make filter

const filter = makeStdioFilterNew({
  ignoreLiteralPrefixes: fs.readFileSync(ignorePrefixFile).toString().split("\n"), // prettier-ignore
  ignoreLiteralLines: fs.readFileSync(ignoreFile).toString().split("\n"),
  includeLine,
  includeJson,
  streamOutput: (line: string) => process.stdout.write(line),
  onLineShown: (line: string) =>
    fs.appendFileSync(shownOutputFile, line + "\n"),
  mapLineBeforeFilter,
  mapLineBeforeOutput,
});

process.stdin.on("data", (data) => {
  fs.appendFileSync(allOutputFile, data);
  filter(data.toString());
});

//ignore signals. We keep running until stdin is closed.

process.on("SIGTERM", () => {});
process.on("SIGINT", () => {});
process.on("SIGQUIT", () => {});
process.on("SIGHUP", () => {});
