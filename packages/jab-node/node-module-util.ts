import nativeModule from "module";
import isBuiltinModule from "is-builtin-module";

//hack because of typing mismatch.

import type { SharedMap as SharedMapType } from "sharedmap";
const SharedMap = require("sharedmap") as typeof SharedMapType;

// to handle webpack as compiler.

export const nodeRequire: NodeRequire = eval("require");

/**
 * useful, when lazy require should be disabled for a single require call.
 *
 * - lazy require will remain active transitively.
 *
 * note
 *  to be compatible with webpack, use this: `eval("require.eager || require")`
 */
export const eagerRequire = (require: any, id: any) =>
  (require.eager || require)(id);

export type LoadFunction = (
  this: FullNodeModule,
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean
) => string;

export type OriginalLoadFunction = (
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean
) => string;

export type CompileFunction = (content: string, filename: string) => void;

export type OfficialExtensionFunction = (
  module: NodeJS.Module,
  filename: string
) => void;

export type InternalExtensionFunction = (
  module: FullNodeModule,
  filename: string
) => void;

export type ResolveFilename = (
  request: string,
  parent: any,
  isMain: boolean
) => string;

export type ModuleInternals = {
  _resolveFilename: ResolveFilename;
  _load: LoadFunction;
  _compile: CompileFunction;
  _pathCache: { [_: string]: string };
};

export type FullNodeModule = NodeJS.Module & ModuleInternals;
export type FullNativeModule = typeof nativeModule & ModuleInternals;

//to get the full typing.
export const Module = nativeModule as unknown as FullNativeModule;

//
// _load
//

/**
 *
 */
export const plugIntoModuleLoadOld = (func: LoadFunction) => {
  if ((nativeModule as any)._originalLoad) {
    throw new Error("Already registered require sender.");
  }

  (nativeModule as any)._originalLoad = Module._load;

  Module._load = func;
};

/**
 *
 * Can be used to
 *  - Intercept all calls to require.
 */
export const plugIntoModuleLoad = (
  makeLoad: (original: OriginalLoadFunction) => LoadFunction
) => {
  const load = makeLoad((Module as any)._load.bind(nativeModule));

  Module._load = load;
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
export const registerExtensionsOld = (
  exts: string[],
  handler: InternalExtensionFunction
) => {
  for (const ext of exts) {
    if (nodeRequire.extensions[ext]) {
      throw new Error("Extension handler already registered for: " + ext);
    }

    nodeRequire.extensions[ext] = handler as OfficialExtensionFunction;
  }
};

/**
 *
 */
export const registerExtensions = (
  exts: string[],
  makeHandler: (
    original?: InternalExtensionFunction
  ) => InternalExtensionFunction,
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
 * isn't registerExtensions good enough.
 */
export const registerExtension = (
  ext: string,
  makeHandler: (
    original?: InternalExtensionFunction
  ) => InternalExtensionFunction
) => {
  const handler = makeHandler(nodeRequire.extensions[ext]);

  nodeRequire.extensions[ext] = handler as OfficialExtensionFunction;
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
  registerExtensionsOld(exts, (module, filename) => {
    const content = preCompiler(filename);

    return module._compile(content, filename);
  });
};

/**
 * Transform loaded code, before it's compiled as oridinary JavaScript code.
 *
 * - The original .js handler loads the file, and calls `module._compile`.
 */
export const registerCompile = (
  ext: string,
  makeHandler: (original: CompileFunction) => CompileFunction
) => {
  const originalJs = nodeRequire.extensions[".js"]; //capture before, in case '.js' is registered.

  registerExtension(ext, () => (module, filename) => {
    module._compile = makeHandler(module._compile);

    return originalJs(module, filename);
  });
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

/**
 *
 */
export const makeCachedResolveOld = (
  original: ResolveFilename
): ResolveFilename => {
  const cache = new Map<string, string>();

  return (request, parent, isMain) => {
    if (isMain) {
      //don't know what is special, so let node handle it.
      return original(request, parent, isMain);
    }

    const key = request + "\x00" + parent.path;

    const val = cache.get(key);

    if (val) {
      return val;
    }

    const val2 = original(request, parent, isMain);

    cache.set(key, val2);

    return val2;
  };
};

/**
 * Cache node's resolve function
 */
export const cacheResolveOld = () => interceptResolve(makeCachedResolveOld);

/**
 *
 */
export const makeSharedResolveMap = () => {
  const maxEntries = 10000;

  // Size is in UTF-16 codepoints
  const keySize = 300;
  const valueSize = 200;

  return new SharedMap(maxEntries, keySize, valueSize);
};

/**
 * Caches resolved files in node_modules.
 *
 * - Doesn't cache native modules, because that makes no sense.
 * - Doesn't cache files in project, because they change, and invalidate logic is then needed
 *
 *
 * impl
 *  - Use \x01 byte as separator, because SharedMap uses \x00
 */
export const makeMakeCachedResolve =
  (sharedMap: any) =>
  (original: ResolveFilename): ResolveFilename => {
    // Manually restore the prototype of SharedMap
    Object.setPrototypeOf(sharedMap, SharedMap.prototype);

    return (request, parent, isMain) => {
      if (isMain) {
        //don't know what is special, so let node handle it.
        return original(request, parent, isMain);
      }

      const key = request + "\x01" + parent.path;

      const cachedValue = sharedMap.get(key);

      if (cachedValue) {
        return cachedValue;
      }

      const newValue = original(request, parent, isMain);

      if (!isBuiltinModule(request) && newValue.includes("node_modules")) {
        sharedMap.set(key, newValue);
      }

      return newValue;
    };
  };
