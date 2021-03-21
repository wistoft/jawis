import nativeModule from "module";

// to handle webpack as compiler.
export const nodeRequire: NodeRequire = eval("require");

export type LoadFunction = (
  this: FullNodeModule,
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean
) => string;

export type OfficialExtensionFunction = (
  module: NodeJS.Module,
  filename: string
) => void;

export type CompileFunction = (content: string, filename: string) => void;

export type InternalExtensionFunction = (
  module: FullNodeModule,
  filename: string
) => void;

export type ModuleInternals = {
  _resolveFilename: (request: string, parent: any, isMain: boolean) => string;
  _originalLoad: LoadFunction;
  _compile: CompileFunction;
};

export type FullNodeModule = NodeJS.Module & ModuleInternals;

//
// _load
//

/**
 *
 */
export const plugIntoModuleLoad = (func: LoadFunction) => {
  if ((nativeModule as any)._originalLoad) {
    throw new Error("Already registered require sender.");
  }

  (nativeModule as any)._originalLoad = (nativeModule as any)._load;

  (nativeModule as any)._load = func;
};

/**
 * Register extension handlers, that precompiles source files to JavaScript.
 *
 * - The original .js extension handler is not called, because it loads the file. It might cause problems, as it does some stuff.
 * - The precompiler must load the file itself.
 * - The precompiler doesn't get access to Module, because it doesn't need it.
 */
export const registerPrecompiler = (
  exts: string[],
  preCompiler: (filename: string) => string
) => {
  registerExtensions(exts, (module, filename) => {
    const content = preCompiler(filename);

    return module._compile(content, filename);
  });
};

/**
 *
 */
export const registerExtensions = (
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
