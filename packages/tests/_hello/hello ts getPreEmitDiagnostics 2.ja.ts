import { dianosticToString } from "^jacs";
import { TestProvision } from "^jarun";
import ts from "typescript";
import { getInMemoryCompilerHost } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const options: ts.CompilerOptions = {};

  const host = getInMemoryCompilerHost(options, {
    defaultFiles: {
      "/file.ts": ` import {a} from "./file2"
                    const b :string = a
                  `,
      "/file2.ts": `export const a: boolean | number  = 1;
                  `,
    },
    debug: (str) => {
      prov.log("InMemoryCompilerHost", str);
    },
  });

  const program = ts.createProgram({
    options,
    rootNames: ["/file.ts", "/file2.ts"],
    host,
  });

  const diag = ts.getPreEmitDiagnostics(program);

  //
  // output
  //

  prov.imp(ts.formatDiagnostics(diag, host));

  prov.imp(dianosticToString(diag));

  prov.imp(
    diag.map((a) => {
      const d = { ...a };

      delete d.file;
      return d;
    })
  );
};
