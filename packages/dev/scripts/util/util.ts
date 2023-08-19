import fs from "fs";
import path from "path";
import { objMap, tos } from "^jab";
import { allPackagesIncludingPrivate, projectRoot } from "^dev/project.conf";

/**
 *
 */
export const updatePackageJson = async (deps: {
  map: (obj: {}) => {};
  updateRoot: boolean;
}) => {
  if (deps.updateRoot) {
    updateOnePackageJson(path.join(projectRoot, "package.json"), deps.map);
  }

  for (const packageName of allPackagesIncludingPrivate) {
    const file = path.join( projectRoot, "packages", packageName, "package.json" ); // prettier-ignore

    updateOnePackageJson(file, deps.map);
  }
};

/**
 *
 */
export const updateOnePackageJson = async (
  file: string,
  map: (obj: {}) => {}
) => {
  //read

  const jsonStr = (await fs.promises.readFile(file)).toString();

  let json = JSON.parse(jsonStr);

  //update package json

  json = map(json);

  //write

  const newJsonStr = JSON.stringify(json, null, 2) + "\n";

  await fs.promises.writeFile(file, newJsonStr);
};

/**
 *
 */
export const fixatePackageJsonMapper =
  (
    mode: "exact" | "relative",
    mapVersion: (key: string, value: string) => string = (key, value) => value
  ) =>
  (json: any) => {
    if (!json.dependencies) {
      return json;
    }

    json.dependencies = objMap(json.dependencies, (key: any, value: string) => {
      const exact = mapVersion(key, value.replace(/^\^/, ""));

      switch (mode) {
        case "exact":
          return exact;

        case "relative":
          return "^" + exact;

        default:
          throw new Error("Unknown mode: " + mode);
      }
    });

    return json;
  };
