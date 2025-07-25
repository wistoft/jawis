export type LoadFunction = (
  request: string,
  parent: NodeModule | null | undefined,
  isMain: boolean
) => string;

export type CompileFunction = (content: string, filename: string) => void;

export type OfficialExtensionFunction = (
  module: NodeJS.Module,
  filename: string
) => void;

export type ExtensionFunction = (
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
