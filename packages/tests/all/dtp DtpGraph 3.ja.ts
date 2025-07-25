import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//import name space

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": ``,
    "/file2.ts": `import * as ns from "/file"
                  `,
  });

  prov.eq(new Set(["ns#/file2.ts"]), g.getNamespaceImpact("/file.ts"));
};
