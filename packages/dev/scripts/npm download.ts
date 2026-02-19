import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";
import urllib from "urllib";
import { rimraf } from "rimraf";
import compressing from "compressing";

import { assert } from "^jab";
import * as mainConf from "^dev/project.conf";

import { getNpmLatestInfo } from "./util/index";

/**
 *
 */
const doit = async () => {
  await downloadAllLivePackages();
};

/**
 *
 */
const downloadAllLivePackages = async () => {
  await downloadJawisPackages({
    ...mainConf,
    outBasedir: mainConf.publishBuildFolder,
  });
};

/**
 *
 */
const downloadJawisPackages = async (deps: {
  unscopedPackages: string[];
  scopedPackages: string[];
  outBasedir: string;
}) => {
  for (const packageName of deps.unscopedPackages) {
    downloadHelper(packageName, deps.outBasedir); //no need to await
  }

  for (const packageName of deps.scopedPackages) {
    downloadHelper(packageName, deps.outBasedir, "@jawis/"); //no need to await
  }
};

/**
 *
 */
const downloadHelper = async (
  shortPackageName: string,
  outBasedir: string,
  scope = ""
) => {
  const outdir = path.join(outBasedir, shortPackageName);

  await downloadLatestNpmPackage(scope + shortPackageName, outdir);

  console.log(scope + shortPackageName);
};

/**
 *
 * A little hacky to use a temporary folder.
 */
const downloadLatestNpmPackage = async (
  packageName: string,
  outdir: string
) => {
  assert(path.isAbsolute(outdir));

  const tmpOutdir = outdir + "-tmp";

  await rimraf(outdir);
  await rimraf(tmpOutdir);

  const data = await getNpmLatestInfo(packageName);

  if (!data) {
    throw new Error("Not found");
  }

  const tarballUrl = data.dist.tarball;

  const result = await urllib.request(tarballUrl, {
    streaming: true,
  });

  await compressing.tgz.uncompress(result.res as any, tmpOutdir);

  await fse.move(path.join(tmpOutdir, "package"), outdir);

  await fs.promises.rmdir(tmpOutdir);
};

doit();
