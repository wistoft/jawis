import fs from "fs";
import path from "path";
import { makeStdioFilter } from ".";

//conf

const timeout = 300;
const folder = __dirname;
const ignoreFile = path.join(folder, "../../console-filter/cf-ignore.txt");
const allOutputFile = path.join(folder, "../../console-filter/cf-all.txt");
const shownOutputFile = path.join(folder, "../../console-filter/cf-shown.txt");

//clear

fs.writeFileSync(allOutputFile, "");
fs.writeFileSync(shownOutputFile, "");

//begin

const ignore = fs.readFileSync(ignoreFile);
const ignoreLines = ignore.toString().split("\n");

const includeLine = (line: string) => {
  return !ignoreLines.includes(line);
};

let previousWasDot = false;

const filter = makeStdioFilter(
  (data) => {
    if (data) {
      fs.appendFileSync(shownOutputFile, data);

      if (previousWasDot) {
        process.stdout.write("\n");
      }
      process.stdout.write(data);

      previousWasDot = false;
    } else {
      process.stdout.write(".");

      previousWasDot = true;
    }
  },
  includeLine,
  timeout
);

process.stdin.on("data", (data) => {
  fs.appendFileSync(allOutputFile, data);
  filter(data);
});
