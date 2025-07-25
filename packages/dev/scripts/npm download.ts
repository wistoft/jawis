import fs from "node:fs";
import path from "node:path";
import fse from "fs-extra";
import urllib from "urllib";
import del from "del";
import compressing from "compressing";
import { assert } from "^jab";
import fetch, { HeadersInit } from "node-fetch";
import { getNpmInfo, getNpmLatestInfo } from "./util/index";
import { BeeMain } from "^bee-common/types";
import * as mainConf from "^dev/project.conf";

/**
 *
 */
export const main: BeeMain = async () => {
  // await downloadHelper("lazy-require-ts");
  // await downloadHelper("jagov", "@jawis/");

  await downloadAllLivePackages();
};

/**
 *
 */
export const downloadAllLivePackages = async () => {
  await downloadJawisPackages({
    ...mainConf,
    basedir: mainConf.publishBuildFolder,
  });
};

/**
 *
 */
export const downloadJawisPackages = async (deps: {
  unscopedPackages: string[];
  scopedPackages: string[];
  basedir: string;
}) => {
  for (const packageName of deps.unscopedPackages) {
    downloadHelper(packageName, deps.basedir); //no need to await
  }

  for (const packageName of deps.scopedPackages) {
    downloadHelper(packageName, deps.basedir, "@jawis/"); //no need to await
  }
};

/**
 *
 */
export const downloadHelper = async (
  shortPackageName: string,
  basedir: string,
  scope = ""
) => {
  const outdir = path.join(basedir, shortPackageName);

  await downloadLatestNpmPackage(scope + shortPackageName, outdir);

  console.log(scope + shortPackageName);
};

/**
 *
 * A little hacky to use a temporary folder.
 */
export const downloadLatestNpmPackage = async (
  packageName: string,
  outdir: string
) => {
  assert(path.isAbsolute(outdir));

  const tmpOutdir = outdir + "-tmp";

  await del(outdir, { force: true });
  await del(tmpOutdir, { force: true });

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
