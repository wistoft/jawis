import { err } from "^jab";

import { WebpackExternalsFunc } from "./internal";

/**
 * Statically determines if a import is a node_modules import.
 *
 * notes
 * - hacky, because it doesn't handle import alias properly.
 * - duplicated with: categorizeImportSpecifier
 *
 */
export const makeNodeExternals =
  (): WebpackExternalsFunc =>
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
