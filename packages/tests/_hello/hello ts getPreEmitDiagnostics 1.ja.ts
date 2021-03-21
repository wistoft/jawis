import { dianosticToString } from "^jacs";
import { TestProvision } from "^jarun";
import ts from "typescript";
import { getInMemoryCompilerHost } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const options: ts.CompilerOptions = {};

  const host = getInMemoryCompilerHost(options, {
    defaultFiles: { "file.ts": "const t: number = '';" },
    debug: prov.div,
  });

  const program = ts.createProgram({
    options,
    rootNames: ["file.ts"],
    host,
  });

  const diag = ts.getPreEmitDiagnostics(program);

  //
  // output
  //

  prov.imp(dianosticToString(diag));

  prov.imp(
    diag.map((a) => {
      const d = { ...a };

      delete d.file;
      return d;
    })
  );
};
