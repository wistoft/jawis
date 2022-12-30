import fs from "fs";
import path from "path";
import { allPackagesIncludingPrivate, projectRoot } from "../project.conf";

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

writeRootTsConfig();
