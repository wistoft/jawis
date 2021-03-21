import { TestProvision } from "^jarun";
import ts from "typescript";
import { getInMemoryCompilerHost } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const source = `
  const t: number = '';
  import {a} from "library"
  export const f = () => {}
  export default myVar;
  export * from "library"
  export {a} from "library"
  export {b,c}
  export {d as alias}
  `;

  const opt = {
    compilerOptions: {
      esModuleInterop: false, //large effect.
      allowSyntheticDefaultImports: false, //no effect
      reportDiagnostics: true,
    },
  };

  const host = getInMemoryCompilerHost(opt.compilerOptions, {
    defaultFiles: { "file.ts": source },
    debug: (str) => {
      prov.log("InMemoryCompilerHost", str);
    },
  });

  const program = ts.createProgram({
    rootNames: ["file.ts"],
    options: opt.compilerOptions,
    host,
  });

  const checker = program.getTypeChecker();
  // moduleList = [];
  // symbolTbl = {};

  for (const file of program.getSourceFiles()) {
    if (file.isDeclarationFile) {
      prov.div("declaration: " + file.fileName);
    } else {
      //list of exported names.
      // alias if applicable.S
      // export * is not listed

      prov.imp(
        checker
          .getExportsOfModule((file as any).symbol)
          .map((elm) => elm.escapedName)
      );

      prov.imp(Array.from((file as any).resolvedModules.keys()));

      prov.div({
        ...file,
        statements: "filtered",
        locals: "filtered",
        endOfFileToken: "filtered",
        externalModuleIndicator: "filtered",
        symbol: "filtered",
        nextContainer: "filtered",
        imports: "filtered",
      });
    }
  }
};
