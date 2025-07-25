import { nodeRequire } from "^jab-node";

import {
  CompileFunction,
  ExtensionFunction,
  LoadFunction,
  Module,
  OfficialExtensionFunction,
  ResolveFilename,
} from "./internal";

/**
 *
 * Can be used to
 *  - Intercept all calls to require.
 */
export const plugIntoModuleLoad = (
  makeLoad: (original: LoadFunction) => LoadFunction
) => {
  const original = Module._load;

  Module._load = makeLoad(Module._load.bind(Module as any));

  return () => {
    Module._load = original;
  };
};

/**
 *
 * Can be used to
 *  - Intercept resolve.
 *  - Cached by relativeResolveCache. So only called once for each parent/request combination
 *      Except for native modules, they will be called always.
 */
export const interceptResolve = (
  makeResolve: (original: ResolveFilename) => ResolveFilename
) => {
  const original = Module._resolveFilename;

  Module._resolveFilename = makeResolve(Module._resolveFilename);

  return () => {
    Module._resolveFilename = original;
  };
};

/**
 *
 */
export const registerExtensions = (
  exts: string[],
  makeHandler: (original?: ExtensionFunction) => ExtensionFunction,
  allowPrevious = false
) => {
  for (const ext of exts) {
    if (!allowPrevious && nodeRequire.extensions[ext]) {
      throw new Error("Extension handler already registered for: " + ext);
    }

    const handler = makeHandler(nodeRequire.extensions[ext]);

    nodeRequire.extensions[ext] = handler as OfficialExtensionFunction;
  }
};

/**
 * Register extension handlers, that precompiles source files to JavaScript.
 *
 * - The precompiler must load the file itself.
 * - The precompiler doesn't get access to Module, because it doesn't need it.
 *
 * note
 *  - The original .js extension handler is not called, because it loads the file. It might cause problems, as it does some stuff.
 */
export const registerPrecompilers = (
  exts: string[],
  preCompiler: (filename: string) => string
) => {
  registerExtensions(
    exts,
    () => (module, filename) => module._compile(preCompiler(filename), filename)
  );
};

/**
 * Transform loaded code, before it's compiled as oridinary JavaScript code.
 *
 * - The original .js handler loads the file, and calls `module._compile`.
 */
export const registerCompile = (
  ext: string,
  makeHandler: (original: CompileFunction) => CompileFunction,
  allowPrevious = false
) => {
  const originalJs = nodeRequire.extensions[".js"]; //capture before, in case '.js' is registered.

  registerExtensions(
    [ext],
    () => (module, filename) => {
      module._compile = makeHandler(module._compile.bind(module));

      return originalJs(module, filename);
    },
    allowPrevious
  );
};

/**
 *
 */
export const clearModuleCache = (files = Object.keys(require.cache)) => {
  files.forEach((key) => {
    delete require.cache[key];
  });
};

/**
 * - Bug: Can't clear relativeResolveCache.
 */
export const clearResolveCache = () => {
  Object.keys(Module._pathCache).forEach((key) => {
    delete Module._pathCache[key];
  });
};
