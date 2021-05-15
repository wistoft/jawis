import { extractDeps } from "^util/dtp";
import { TestProvision } from "^jarun";
import { getInMemoryCompilerHost } from "^tests/_fixture";
import { getSourceFile } from "../_fixture";

export default (prov: TestProvision) => {
  const host = getInMemoryCompilerHost(
    {},
    {
      defaultFiles: {
        "/file.ts": "const t: number = '';",
        "/node_modules/library/index.ts": "",
      },
      debug: prov.div,
    }
  );

  // the imported file

  prov.imp(extractDeps(getSourceFile(`import "library"`), {}, host));
  prov.imp(extractDeps(getSourceFile(`import "./file"`), {}, host));

  prov.imp(extractDeps(getSourceFile(`import "/file"`), {}, host));
  prov.imp(
    extractDeps(getSourceFile(`import "./resolvedAway/../file"`), {}, host)
  );

  //named imports

  prov.imp(
    extractDeps(getSourceFile(`import {a, b as brave} from "./file"`), {}, host)
  );

  //namespace import

  prov.imp(
    extractDeps(getSourceFile(`import * as ns from "./file"`), {}, host)
  );

  //default

  prov.imp(extractDeps(getSourceFile(`import def from "./file"`), {}, host));
  prov.imp(
    extractDeps(getSourceFile(`import def, {a} from "./file"`), {}, host)
  );

  prov.imp(
    extractDeps(getSourceFile(`import def, * as ns from "./file"`), {}, host)
  );
};
