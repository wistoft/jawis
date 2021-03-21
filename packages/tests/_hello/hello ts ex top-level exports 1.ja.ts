import { TestProvision } from "^jarun";
import ts, { Node } from "typescript";

import { getTsProjectPath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  extract(getTsProjectPath("library.ts"), ["saySomething"]);
};

/**
 * Prints out particular nodes from a source file
 *
 * @param file a path to a file
 * @param identifiers top level identifiers available
 */
function extract(file: string, identifiers: string[]): void {
  // Create a Program to represent the project, then pull out the
  // source file to parse its AST.
  const program = ts.createProgram([file], { allowJs: true });
  const sourceFile = program.getSourceFile(file);

  if (!sourceFile) {
    console.log("not found");
    return;
  }

  // printTsNode(sourceFile);

  // To print the AST, we'll use TypeScript's printer
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  // To give constructive error messages, keep track of found and un-found identifiers
  const unfoundNodes: [string, Node][] = [],
    foundNodes: [string, Node][] = [];

  // Loop through the root AST nodes of the file
  ts.forEachChild(sourceFile, (node) => {
    let name = "";

    // This is an incomplete set of AST nodes which could have a top level identifier
    // it's left to you to expand this list, which you can do by using
    // https://ts-ast-viewer.com/ to see the AST of a file then use the same patterns
    // as below
    if (ts.isFunctionDeclaration(node)) {
      name = node.name?.text || "";
      // console.log("func: " + name);
      // Hide the method body when printing
      (node as any).body = undefined;
    } else if (ts.isVariableStatement(node)) {
      name = node.declarationList.declarations[0].name.getText(sourceFile);
      // console.log("var: " + name);
    } else if (ts.isInterfaceDeclaration(node)) {
      name = node.name.text;
      // console.log("interface: " + name);
    }

    const container =
      name && identifiers.includes(name) ? foundNodes : unfoundNodes;

    container.push([name, node]);
  });

  // Either print the found nodes, or offer a list of what identifiers were found
  if (!foundNodes.length) {
    console.log(
      `Could not find any of ${identifiers.join(
        ", "
      )} in ${file}, found: ${unfoundNodes
        .filter((f) => f[0])
        .map((f) => f[0])
        .join(", ")}.`
    );
    process.exitCode = 1;
  } else {
    foundNodes.map((f) => {
      const [name, node] = f;
      console.log("### " + name + "\n");
      console.log(
        printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)
      ) + "\n";
    });
  }
}
