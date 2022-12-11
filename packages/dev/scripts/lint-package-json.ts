import fs from "fs";
import path from "path";
import { webpackCompileHelper } from "./util/build";
import fastGlob from "fast-glob";
import { packagesPatternIncludingPrivate, projectRoot } from "../project.conf";
import { sortObject } from "./build/util";

/**
 *
 */
(async () => {
  const versions = new Map<string, string>();

  /**
   *
   */
  const fixPackageJson = async (file: string) => {
    const jsonStr = await fs.promises.readFile(file);

    const json = JSON.parse(jsonStr.toString());

    if (json.dependencies) {
      //sort

      json.dependencies = sortObject(json.dependencies);

      await fs.promises.writeFile(file, JSON.stringify(json, null, 2) + "\n");

      //check versions

      for (const [dep, version] of Object.entries<string>(json.dependencies)) {
        const stored = versions.get(dep);
        if (stored !== undefined && stored !== "error-seen") {
          if (version !== stored) {
            console.log("Version is not consistent across all packages: " + dep); // prettier-ignore
            versions.set(dep, "error-seen");
          }
        } else {
          versions.set(dep, version);
        }
      }
    }
  };

  //
  // main
  //

  const packages = await fastGlob([packagesPatternIncludingPrivate], {
    cwd: path.join(projectRoot, "packages"),
    onlyDirectories: true,
  });

  //root package.json

  await fixPackageJson(path.join(projectRoot, "package.json"));

  //in packages

  for (const packageName of packages) {
    await fixPackageJson(
      path.join(projectRoot, "packages", packageName, "package.json")
    );
  }
})();
