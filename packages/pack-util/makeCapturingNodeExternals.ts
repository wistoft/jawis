import fs from "node:fs";
import path from "node:path";

import { AbsoluteFile, err, hasProp } from "^jab";
import { locateProjectJson, nodeRequire } from "^jab-node";

import { makeNodeExternals, OnExternals } from "./internal";

/**
 * Capture required node modules, so we can generate a package.json.
 */
export const makeCapturingNodeExternals = (packageJsonFile: AbsoluteFile) => {
  const map: Map<string, { request?: string; context?: string }> = new Map();

  /**
   *
   */
  const onExternals: OnExternals = (data) => {
    //quick fix
    const request = data.request?.replace(/react-dom\/client/, "react-dom");

    //map ensures we eliminate duplicates
    map.set(request + "\x00" + data.context, {
      request,
      context: data.context,
    });
  };

  /**
   *
   */
  const externals = makeNodeExternals(onExternals);

  /**
   *
   */
  const writePackageJson = (folder: string, packageName: string) => {
    fs.writeFileSync(
      path.join(folder, "package.json"),
      getPackageJson(packageName)
    );
  };

  /**
   * todo: clean up, now it's not a monorepo thing.
   */
  const getPackageJson = (packageName: string) => {
    const deps: Map<string, string> = new Map(); //name => version

    for (const entry of map.values()) {
      if (!entry.request) {
        throw new Error("request can't be undefined");
      }
      if (!entry.context) {
        throw new Error("context can't be undefined");
      }

      //get version from the package.json nearest to context (position of require).

      // const file = locateProjectJson(entry.context);

      // if (!file) {
      //   throw new Error("Could not find package.json for: " + file);
      // }

      const packageJson = nodeRequire(packageJsonFile);

      const packageJsonDeps = {
        ...packageJson.dependencies,
        ...packageJson.peerDependencies,
      };

      if (!hasProp(packageJsonDeps, entry.request)) {
        err("Could not find dependency: " + entry.request, {
          entry,
          packageJson,
        });
      }

      const version = packageJsonDeps[entry.request];

      if (!version) {
        err("package.json didn't contain the package ", {
          ...entry,
          // "package.json": file,
        });
      }

      //check there isn't any conflicting version for same package.

      const existing = deps.get(entry.request);

      if (existing && existing !== version) {
        err("Different version already added ", {
          existing,
          new: version,
          ...entry,
          // "package.json": file,
        });
      }

      //add dependency

      deps.set(entry.request, version);
    }

    //
    // output
    //

    const depsString = Array.from(deps.keys())
      .sort()
      .map((key) => `"${key}": "${deps.get(key)}"`)
      .join(",\n    ");

    return `{
  "name": "${packageName}",
  "version": "0.0.0",
  "license": "MIT",
  "dependencies": {
    ${depsString}
  }
}
`;
  };

  return {
    externals,
    onExternals,
    writePackageJson,
    getPackageJson,
  };
};
