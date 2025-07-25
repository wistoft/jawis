import { AbsoluteFile } from "./internal";

export type OpenFile = (deps: { file: string; line?: number }) => void;

export const DefaultCompiledFolder = "compiled";

export type MainFileDeclaration = SourceFile & {
  type: "web-module" | "web-entry" | "pure-bee" | "node-bee" | "plain-file";
};

export type SourceFile = {
  file: string;
  folder: string;
};

export type GetAbsoluteSourceFile = (deps: SourceFile) => AbsoluteFile;

export type GetUrlToRequire = (deps: SourceFile) => string;
