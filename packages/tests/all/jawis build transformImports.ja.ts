import { TestProvision } from "^jarun";
import {
  getScriptPath,
  makeTestJawisBuildManager,
  testTransformPackageJson,
} from "^tests/_fixture";

export default (prov: TestProvision) => {
  //
  //require
  //

  prov.eq('require("fs")', makeTestJawisBuildManager().transformImports("filename.js", 'require("fs")')); // prettier-ignore

  // unscoped
  prov.eq('require("first-library")', makeTestJawisBuildManager().transformImports("filename.js", 'require("^first-library")')); // prettier-ignore

  // scoped
  prov.eq('require("@jawis/scoped-library")', makeTestJawisBuildManager().transformImports("filename.js", 'require("^scoped-library")')); // prettier-ignore

  //
  //require import-from in d.ts files.
  //

  // unscoped
  prov.eq('import {a} from "first-library"', makeTestJawisBuildManager().transformImports("filename.d.ts", 'import {a} from "^first-library"')); // prettier-ignore

  // scoped;
  prov.eq('import {a} from "@jawis/scoped-library"', makeTestJawisBuildManager().transformImports("filename.d.ts", 'import {a} from "^scoped-library"')); // prettier-ignore

  //
  //require dynamic import
  //

  // unscoped
  prov.eq('import("first-library")', makeTestJawisBuildManager().transformImports("filename.js", 'import("^first-library")')); // prettier-ignore

  // scoped
  prov.eq('import("@jawis/scoped-library")', makeTestJawisBuildManager().transformImports("filename.js", 'import("^scoped-library")')); // prettier-ignore
};
