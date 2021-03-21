import { TestProvision } from "^jarun";
import ts from "typescript";

export default (prov: TestProvision) => {
  const resultFile = ts.createSourceFile(
    "someFileName.ts",
    `export function factorial(n): number {
	    if (n <=  1) {
	        return 1;
	    }
	    return n * factorial(n - 1);
	}`,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );

  //
  // print
  //

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    resultFile,
    resultFile
  );

  console.log(result);
};
