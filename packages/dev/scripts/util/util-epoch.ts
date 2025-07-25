import fs from "node:fs";
import path from "node:path";
import { objMap, tos } from "^jab";

/**
 * Apply a map to a package.json file and write it back.
 *
 */
export const updatePackageJson = async (file: string, map: (obj: {}) => {}) => {
  //read

  const jsonStr = (await fs.promises.readFile(file)).toString();

  let json = JSON.parse(jsonStr);

  //update package json

  json = map(json);

  //write

  const newJsonStr = JSON.stringify(json, null, 2) + "\n";

  await fs.promises.writeFile(file, newJsonStr);
};
