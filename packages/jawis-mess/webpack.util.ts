import { err } from "^jab";

//quick fix
type WebpackExternalsFunc = (
  data: { request?: string; context?: string },
  callback: (
    err?: Error,
    result?: string | boolean | string[] | { [index: string]: any }
  ) => void
) => void;

/**
 * Statically determines if a import is a node_modules imports.
 *
 * - hacky, because it doesn't handle import alias properly.
 *
 */
export const nodeExternals: WebpackExternalsFunc = (
  { request, context },
  callback
) => {
  if (request === undefined) {
    return callback();
  }

  // quick fix for import aliases in jadev.
  if (request.startsWith("^")) {
    return callback();
  }

  //relative/absolute
  if (/^(\.|\/|\w:)/.test(request)) {
    return callback();
  }

  //unscoped
  if (/^[a-z0-9\-_]/i.test(request)) {
    // Externalize to a commonjs module using the request path
    return callback(undefined, "commonjs " + request);
  }

  //scoped
  if (request.startsWith("@")) {
    // Externalize to a commonjs module using the request path
    return callback(undefined, "commonjs " + request);
  }

  err("unknown import", { context, request });
};
