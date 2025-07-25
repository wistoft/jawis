import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";
import urllib from "urllib";
import del from "del";
import compressing from "compressing";
import { assert, toInt } from "^jab";
import fetch, { HeadersInit } from "node-fetch";
import {
  fetchJson,
  getNpmInfo,
  Cache,
  tryGetPackageTotalDownloadByVersions,
} from "./util";
import { BeeMain } from "^bee-common/types";
import { parseYarnLock } from "./util/util-yarn";
import { projectRoot } from "^dev/project.conf";

const lockFile = path.join(projectRoot, "yarn.lock");

/**
 *
 */
export const main: BeeMain = async () => {
  const tmpfile = path.join(os.tmpdir(), "jawis/npm list deps.json");
  let cache = {};
  if (fs.existsSync(tmpfile)) {
    cache = JSON.parse(fs.readFileSync(tmpfile).toString());
  }

  try {
    await doit(cache);

    fse.ensureDirSync(path.dirname(tmpfile));
    fs.writeFileSync(tmpfile, JSON.stringify(cache));
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 */
export const doit = async (cache: Cache) => {
  const { deps } = await parseYarnLock(lockFile);

  console.log(deps.size);

  const more = await Promise.all(
    Array.from(deps).map(async (dep) => ({
      dep,
      total: await tryGetPackageTotalDownloadByVersions(dep, cache),
    }))
  );

  console.log(more.filter((elm) => elm.total !== undefined).length);

  more
    .sort((a, b) => {
      if (a.total === undefined && b.total === undefined) {
        return 0;
      }
      if (a.total === undefined) {
        return 1;
      }
      if (b.total === undefined) {
        return -1;
      }

      return a.total - b.total;
    })
    .forEach((elm) => {
      if (elm.total !== undefined) {
        console.log(elm.total + " " + elm.dep);
      }
    });
};
