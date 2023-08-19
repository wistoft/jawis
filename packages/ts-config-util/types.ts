//taken from typescript.d.ts
export interface MapLike<T> {
  [index: string]: T;
}

export interface DiagnosticMessageChain {
  messageText: string;
  next?: DiagnosticMessageChain[];
}

export interface Diagnostic {
  messageText: string | DiagnosticMessageChain;
}

export interface System {
  fileExists(path: string): boolean;
  readFile(path: string, encoding?: string): string | undefined;
}

export interface TypeScript {
  findConfigFile( searchPath: string, fileExists: (fileName: string) => boolean, configName?: string ): string | undefined; // prettier-ignore

  readConfigFile(fileName: string, readFile: (path: string) => string | undefined): { config?: any; error?: Diagnostic;}; // prettier-ignore

  parseJsonConfigFileContent( json: any, host: any, basePath: string, existingOptions?: any, configFileName?: string, resolutionStack?: any[], extraFileExtensions?: readonly any[], extendedConfigCache?: any, existingWatchOptions?: any ): any; // prettier-ignore

  sys: System;
}
