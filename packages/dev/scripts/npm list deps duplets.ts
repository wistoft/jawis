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
} from "./util/index";
import { BeeMain } from "^bee-common/types";
import { parseYarnLock } from "./util/util-yarn";
import { projectRoot } from "^dev/project.conf";

const lockFile = path.join(projectRoot, "yarn.lock");

/**
 *
 */
export const main: BeeMain = async () => {
  const { all, deps, json } = await parseYarnLock(lockFile);

  const duplets = Array.from(all).filter((elm) => elm[1].size > 1);

  console.log(deps.size);
  console.log(all.size);
  console.log(duplets.length);

  console.log(duplets);

  // console.log(json);
};
