import fs from "fs";
import ts, { Node } from "typescript";

export const getJsxSourceFile = (source: string) => {
  return ts.createSourceFile(
    "myFileName.tsx",
    source,
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ false
  );
};

export const getSourceFile = (source: string, filename = "myFileName.ts") => {
  return ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ false
  );
};

export const writeSimpleConfigFile = (file: string) => {
  fs.writeFileSync(
    file,
    JSON.stringify({
      compilerOptions: {
        isolatedModules: false,
      },
      files: ["./hello.js"],
    })
  );
};

/**
 *
 */
export const forEachDescendent = (
  node: Node,
  cb: (node: Node, level: number) => void,
  level = 0
) => {
  ts.forEachChild(node, (inner) => {
    cb(inner, level);
    forEachDescendent(inner, cb, level + 1);
  });
};

/**
 *
 */
export const printTsNode = (node: Node) => {
  forEachDescendent(node, (node, level) => {
    console.log(".".repeat(level) + ts.SyntaxKind[node.kind]);
  });
};
