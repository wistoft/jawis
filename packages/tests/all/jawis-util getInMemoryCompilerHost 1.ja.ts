import ts from "typescript";

import { def } from "^jab";
import { TestProvision } from "^jarun";

import { getInMemoryCompilerHost } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const host = getInMemoryCompilerHost(
    {},
    {
      defaultFiles: {
        "first.ts": "first content",
        "./second.ts": "",
        "/another.ts": "",
        "/node_modules/library/index.ts": "",
      },
      debug: prov.div,
    }
  );

  //read

  prov.eq("first content", host.readFile("first.ts"));
  prov.eq("first content", host.readFile("./first.ts"));
  prov.eq("first content", host.readFile("/first.ts"));

  prov.eq("", host.readFile("second.ts"));
  prov.eq("", host.readFile("./second.ts"));
  prov.eq("", host.readFile("/second.ts"));

  prov.eq("", host.readFile("another.ts"));
  prov.eq("", host.readFile("./another.ts"));
  prov.eq("", host.readFile("/another.ts"));

  //dir

  prov.chk(def(host.directoryExists)(""));
  prov.chk(def(host.directoryExists)("."));
  prov.chk(def(host.directoryExists)("./"));
  prov.chk(def(host.directoryExists)("/"));

  prov.chk(def(host.directoryExists)("/node_modules/library/"));
  prov.chk(def(host.directoryExists)("/node_modules/library"));
  prov.chk(def(host.directoryExists)("/node_modules/"));
  prov.chk(def(host.directoryExists)("/node_modules"));
  prov.chk(def(host.directoryExists)("./node_modules"));
  prov.chk(def(host.directoryExists)("node_modules"));

  prov.chk(!def(host.directoryExists)("first.ts"));

  //file exists

  prov.chk(host.fileExists("first.ts"));
  prov.chk(host.fileExists("./first.ts"));
  prov.chk(host.fileExists("/first.ts"));

  prov.chk(host.fileExists("second.ts"));
  prov.chk(host.fileExists("./second.ts"));
  prov.chk(host.fileExists("/second.ts"));

  prov.chk(host.fileExists("another.ts"));
  prov.chk(host.fileExists("./another.ts"));
  prov.chk(host.fileExists("/another.ts"));

  //source files

  prov.eq(
    ts.SyntaxKind.SourceFile,
    host.getSourceFile("first.ts", ts.ScriptTarget.ES2015)?.kind
  );
  prov.eq(
    ts.SyntaxKind.SourceFile,
    host.getSourceFile("./first.ts", ts.ScriptTarget.ES2015)?.kind
  );
  prov.eq(
    ts.SyntaxKind.SourceFile,
    host.getSourceFile("/first.ts", ts.ScriptTarget.ES2015)?.kind
  );
};
