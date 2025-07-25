export type DependencyInfo =
  | Import
  | Export
  | ReExport
  | InternalPieces
  | MainCode;

export type CodePiece = { name: string; deps: string[] };

export type Import = {
  type: "import";
  file: string;
  named?: CodePiece[]; //it can only have one dep. But for simplicity, it's regarded as a code piece.
  nsAlias?: string;
};

export type ReExport = {
  type: "reexport";
  file: string;
  data: "all" | CodePiece[] | { nsAlias: string };
};

export type Export = {
  type: "export";
  data: CodePiece[]; //export can have more than one dep. Because export-default have no internal piece to depend on.
};

export type InternalPieces = {
  type: "internal";
  data: CodePiece[];
};

export type MainCode = {
  type: "main";
  deps: string[];
};

export type BindingInfo = { names: string[]; deps: string[] };
