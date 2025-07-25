import { TestProvision } from "^jarun";

import { replaceImportsInCode } from "^pack-util/internal";

export default (prov: TestProvision) => {
  test(prov, "require");
  test(prov, "import");
};

/**
 *
 */
const test = (prov: TestProvision, type: "require" | "import") => {
  //invalid

  prov.eq(type + `()`, replaceImportsInCode(type + `()`, transformImport));

  //no replacement

  prov.eq(type + `(path)`, replaceImportsInCode(type + `(path)`, transformImport)); // prettier-ignore
  prov.eq(type + `(path + "const")`, replaceImportsInCode(type + `(path + "const")`, transformImport)); // prettier-ignore

  prov.eq(type + `("const" + path)`, replaceImportsInCode(type + `("const" + path)`, transformImport)); // prettier-ignore

  prov.eq(type + `(/*ignore*/"pack")`, replaceImportsInCode(type + `(/*ignore*/"pack")`, transformImport)); // prettier-ignore

  //replacement

  prov.eq(type + `("replaced")`, replaceImportsInCode(type + `("pack")`, transformImport)); // prettier-ignore
};

const transformImport = () => "replaced";
