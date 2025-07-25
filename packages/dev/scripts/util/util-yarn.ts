import fs from "node:fs";
import * as lockfile from "@yarnpkg/lockfile";
import {
  exec,
  execShell,
  JabWorker,
  JabWorkerDeps,
  NodeProcess,
  NodeProcessDeps,
} from "^process-util";
import { err } from "^jab/error";

/**
 *
 */
export const parseYarnLock = async (filename: string) => {
  let file = fs.readFileSync(filename);
  let json = lockfile.parse(file.toString());

  const deps = new Set<string>(); //todo: should be possible to derive this from `all`
  const all = new Map<string, Set<string>>();

  for (let key in json.object) {
    const matches = key.match(/^(.+)@(.+)$/);

    if (matches === null) {
      throw new Error("wrong entry: " + key);
    }

    const name = matches[1];
    const version = json.object[key].version;
    const versionRange = matches[2];

    //unique

    deps.add(name);

    //all

    let cur = all.get(name);

    if (cur === undefined) {
      cur = new Set();
      all.set(name, cur);
    }

    cur.add(version);
  }

  return { deps, all, json };
};
