import { TestProvision } from "^jarun";
import ts from "typescript";
import { printTsNode } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const source = `
  const s:string = 1
  
  import {a} from "library"
  `;

  const sourceFile = ts.createSourceFile(
    "myFileName",
    source,
    ts.ScriptTarget.ES2015,
    /*setParentNodes */ false
  );

  printTsNode(sourceFile);

  //how to use?

  console.log({
    externalModuleIndicator: (sourceFile as any).externalModuleIndicator,
  });

  //info

  console.log({
    ...sourceFile,
    statements: "filtered",
    locals: "filtered",
    endOfFileToken: "filtered",
    externalModuleIndicator: "filtered",
  });
};
