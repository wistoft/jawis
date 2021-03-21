import { TestProvision } from "^jarun";
import ts from "typescript";
import { getInMemoryCompilerHost } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const opt = {
    compilerOptions: {
      esModuleInterop: false, //large effect.
      allowSyntheticDefaultImports: false, //no effect
      reportDiagnostics: true,
    },
  };

  const host = getInMemoryCompilerHost(opt.compilerOptions, {
    defaultFiles: {
      "/file.ts": `import {a} from "./file2"
                 `,
      "/file2.ts": `export const a = 1;
                  `,
    },
    debug: (str) => {
      prov.log("InMemoryCompilerHost", str);
    },
  });

  const program = ts.createProgram({
    rootNames: ["/file.ts", "/file2.ts"],
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

      const exports = checker
        .getExportsOfModule((file as any).symbol)
        .map((elm) => elm.escapedName);

      const imports: any = [];

      if ((file as any)?.resolvedModules) {
        for (const [key, value] of (file as any)?.resolvedModules.entries()) {
          imports.push({
            src: key,
            tgt: value?.resolvedFileName,
          });
        }
      }

      prov.imp({ file: file.fileName, exports, imports });

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
