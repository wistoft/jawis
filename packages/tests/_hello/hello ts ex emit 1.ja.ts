import { TestProvision } from "^jarun";
import ts from "typescript";
import { getTsProjectPath } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const options = {
    declaration: true,
    // emitDeclarationOnly: true,
  };

  // Create a Program with an in-memory emit

  const createdFiles = {} as any;

  const host = ts.createCompilerHost(options);

  host.writeFile = (fileName: string, contents: string) =>
    (createdFiles[fileName] = contents);

  // Prepare and emit the d.ts files

  const program = ts.createProgram(
    [getTsProjectPath("library.ts")],
    options,
    host
  );

  program.emit();

  //
  // output
  //

  console.log(createdFiles);
};
// asdfækasdæf aæfkj aædkfjaæ dfæa æalskdf æakjf æasf
