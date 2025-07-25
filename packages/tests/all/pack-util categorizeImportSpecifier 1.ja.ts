import { TestProvision } from "^jarun";

import { categorizeImportSpecifier } from "^pack-util/internal";

export default (prov: TestProvision) => {
  prov.eq("relative", categorizeImportSpecifier("."));
  prov.eq("relative", categorizeImportSpecifier("./"));

  prov.eq("relative-external", categorizeImportSpecifier(".."));
  prov.eq("relative-external", categorizeImportSpecifier("../"));

  prov.eq("absolute", categorizeImportSpecifier("/"));
  prov.eq("absolute", categorizeImportSpecifier("/some-file.ts"));

  prov.eq("absolute", categorizeImportSpecifier("C:/"));
  prov.eq("absolute", categorizeImportSpecifier("C:/some-file.ts"));

  //file protocol

  prov.eq("absolute", categorizeImportSpecifier("file:///some-file.ts"));
  prov.eq("absolute", categorizeImportSpecifier("file:///C:/some-file.ts"));

  //node

  prov.eq("node-built-in", categorizeImportSpecifier("fs"));
  prov.eq("node-built-in", categorizeImportSpecifier("node:fs"));

  //npm

  prov.eq("npm", categorizeImportSpecifier("react"));

  prov.eq("npm", categorizeImportSpecifier("@types/react"));
};
