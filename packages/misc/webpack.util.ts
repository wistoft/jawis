import fs from "fs";
import path from "path";
import { err } from "^jab";
import isBuiltin from "is-builtin-module";
import { locateProjectJson } from "^util-javi/node";

//quick fix
// it's harder to get this working: `webpack.Configuration["externals"]`
export type WebpackExternalsFunc = (
  data: { request?: string; context?: string },
  callback: (
    err?: Error,
    result?: string | boolean | string[] | { [index: string]: any }
  ) => void
) => void;

export type OnExternals = (data: {
  request?: string;
  context?: string;
}) => void;

/**
 * Statically determines if a import is a node_modules import.
 *
 * todo
 *  - simplify. And remove jawis thing. By using ts-paths for lookup.
 *  - check it handles: 'node:fs'
 */
export const makeNodeExternals = (
  onExternal?: OnExternals
): WebpackExternalsFunc => ({ request, context }, callback) => {
  if (request === undefined) {
    return callback();
  }

  // quick fix for import aliases in jawis.
  // can we use the the module: `TsconfigPathsPlugin`
  if (request.startsWith("^")) {
    return callback();
  }

  //relative/absolute
  if (/^(\.|\/|\w:)/.test(request)) {
    return callback();
  }

  if (!isBuiltin(request)) {
    onExternal && onExternal({ request, context });
  }

  //unscoped npm package
  if (/^[a-z0-9\-_]/i.test(request)) {
    // Externalize to a commonjs module using the request path
    return callback(undefined, "commonjs " + request);
  }

  //scoped npm package
  if (request.startsWith("@")) {
    // Externalize to a commonjs module using the request path
    return callback(undefined, "commonjs " + request);
  }

  err("unknown import", { context, request });
};

/**
 * Capture required node modules, so we can generate a package.json.
 */
export const makeCapturingNodeExternals = () => {
  const map: Map<string, { request?: string; context?: string }> = new Map();

  /**
   *
   */
  const onExternals: OnExternals = (data) => {
    // console.log(data.request, data.context);

    //quick fix, because JestAdaptor hasn't declared a peer dependency on jest.
    const request = data.request?.startsWith("@jest/") ? "jest" : data.request;

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
    const deps: Map<string, string> = new Map(); //name => version

    for (const entry of map.values()) {
      if (!entry.request) {
        throw new Error("request can't undefined");
      }
      if (!entry.context) {
        throw new Error("context can't undefined");
      }

      //get version from the package.json nearest to context (position of require).

      const file = locateProjectJson(entry.context);

      if (!file) {
        throw new Error("Could not finde package.json for: " + file);
      }

      const data = require(file);

      const version = data.dependencies[entry.request];

      if (!version) {
        err("Version not found ", { ...entry, "package.json": file });
      }

      //check there isn't any conflicting version for same package.

      const existing = deps.get(entry.request);

      if (existing && existing !== version) {
        err("Different version already added ", {
          existing,
          new: version,
          ...entry,
          "package.json": file,
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
      .map((key) => `"${key}":"${deps.get(key)}"`)
      .join(",\n");

    fs.writeFileSync(
      path.join(folder, "package.json"),
      `{
  "name": "${packageName}",
  "version": "0.0.0",
  "dependencies": {
    ${depsString}
  }
}`
    );
  };

  return {
    externals,
    onExternals,
    writePackageJson,
  };
};
