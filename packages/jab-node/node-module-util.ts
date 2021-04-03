import nativeModule from "module";

// to handle webpack as compiler.
export const nodeRequire: NodeRequire = eval("require");

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
export const Module = (nativeModule as unknown) as FullNativeModule;

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
 */
export const interceptResolve = (
  makeResolve: (original: ResolveFilename) => ResolveFilename
) => {
  Module._resolveFilename = makeResolve(Module._resolveFilename);
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
 * - The original .js handler loads the file.
 */
export const registerCompile = (
  ext: string,
  makeHandler: (original: CompileFunction) => CompileFunction
) => {
  const originalJs = nodeRequire.extensions[".js"]; //capture before, in case '.js' is registers.

  registerExtension(ext, () => (module, filename) => {
    module._compile = makeHandler(module._compile);

    return originalJs(module, filename);
  });
};

/**
 *
 */
export const clearModuleCache = () => {
  Object.keys(require.cache).forEach((key) => {
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
export const makeCachedResolve = (
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
export const cacheResolve = () => interceptResolve(makeCachedResolve);
