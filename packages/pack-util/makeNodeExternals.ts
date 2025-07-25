import isBuiltin from "is-builtin-module";

import { err } from "^jab";

import { OnExternals, WebpackExternalsFunc } from "./internal";

/**
 * Statically determines if a import is a node_modules import.
 *
 * notes
 * - hacky, because it doesn't handle import alias properly.
 * - duplicated with: categorizeImportSpecifier
 *
 */
export const makeNodeExternals =
  (onExternal?: OnExternals): WebpackExternalsFunc =>
  ({ request, context }, callback) => {
    if (request === undefined) {
      return callback();
    }

    // this is an sub path private to the package. (by convention)
    if (request.startsWith("^")) {
      return callback();
    }

    //relative/absolute
    if (/^(\.|\/|\w:)/.test(request)) {
      return callback();
    }

    if (isBuiltin(request)) {
      // Externalize to a commonjs module using the request path
      return callback(undefined, "commonjs " + request);
    }

    onExternal && onExternal({ request, context });

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

    err("makeNodeExternals: unknown import", { context, request });
  };

/**
 *
 */
export const categorizeImportSpecifier = (specifier: string) => {
  //todo: get the import mapping specific to the repo.
  if (specifier.startsWith("^")) {
    return "sibling";
  }

  if (/^\.\./.test(specifier)) {
    return "relative-external";
  }

  if (/^\./.test(specifier)) {
    return "relative";
  }

  if (/^(\/|\w:)/.test(specifier)) {
    return "absolute";
  }

  if (isBuiltin(specifier)) {
    return "node-built-in";
  }

  //protocol
  if (/^([a-z]+):/.test(specifier)) {
    if (specifier.startsWith("file:///")) {
      return "absolute";
    } else {
      throw err("categorizeImportSpecifier: unknown protocol: " + specifier);
    }
  }

  //unscoped npm package
  if (/^[a-z0-9\-_]/i.test(specifier)) {
    return "npm";
  }

  //scoped npm package
  if (specifier.startsWith("@")) {
    return "npm";
  }

  throw err("categorizeImportSpecifier: unknown import: " + specifier);
};
