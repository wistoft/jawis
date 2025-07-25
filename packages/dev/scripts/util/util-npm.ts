import { exec } from "^process-util";
import { httpRequest } from "^jab-node";
import { err } from "^jab/error";
import { fetchJson } from "./util";

let npmRequests = 0;
let maxNpmRequests = 50;

export type Cache = {
  [_: string | number]: {
    total?: number;
    versions?: {
      [_: string | number]: string;
    };
  };
};

/**
 *
 */
export const getNpmInfo = (packageName: string, throwOnNotFound = true) =>
  httpRequest({
    protocol: "https:",
    hostname: "registry.npmjs.org",
    path: "/" + packageName,
  })
    .then((resp) => JSON.parse(resp.data))
    .then((data) => {
      if (data.error === "Not found")
        if (throwOnNotFound) {
          err("Could find package: " + packageName);
        } else {
          return;
        }

      return data;
    });

/**
 *
 */
export const getNpmLatestInfo = async (
  packageName: string,
  throwOnNotFound = true
): Promise<{ version: string; dist: { tarball: string } } | undefined> => {
  const data = await getNpmInfo(packageName, throwOnNotFound);

  if (data === undefined) {
    return;
  }

  const version = data["dist-tags"].latest;
  return data.versions[version];
};

/**
 *
 */
export const tryGetPackageTotalDownloadByVersions = async (
  packageName: string,
  cache: Cache
) => {
  // use total if exists

  if (cache[packageName]?.total) {
    return cache[packageName].total;
  }

  //use versions

  if (!cache[packageName]?.versions) {
    if (npmRequests++ >= maxNpmRequests) {
      return;
    }

    try {
      const data = await fetchJson(
        "https://api.npmjs.org/versions/" +
          packageName.replace("/", "%2F") +
          "/last-week/"
      );

      if (!cache[packageName]) {
        cache[packageName] = {};
      }

      cache[packageName].versions = data.downloads;
    } catch (error) {
      npmRequests = maxNpmRequests;
      console.log("fetch failed: " + packageName);
      return;
    }
  }

  cache[packageName].total = Object.values(
    cache[packageName].versions as any
  ).reduce<number>((acc, cur: any) => acc + cur, 0);

  return cache[packageName].total;
};
