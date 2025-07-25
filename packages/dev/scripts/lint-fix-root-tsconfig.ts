import fs from "node:fs";
import path from "node:path";
import { allPackagesIncludingPrivate, projectRoot } from "../project.conf";

export const main = async () => {
  await writeRootTsConfig();
};

/**
 *
 */
export const writeRootTsConfig = async () => {
  let innerContent = allPackagesIncludingPrivate
    .sort((a, b) => a.localeCompare(b))
    .map((packageName) => '{ "path": "./packages/' + packageName + '" }')
    .join(",\n    ");

  const content =
    `{
  "extends": "./tsconfig.base.web.json",
  "files": [],
  "references": [
    ` +
    innerContent +
    `
  ]
}
`;

  await fs.promises.writeFile(path.join(projectRoot, "tsconfig.json"), content);
};
