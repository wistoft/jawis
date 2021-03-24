import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//import named

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": `export const b = 1`,
    "/file2.ts": `import {b} from "/file"; 
                  `,
  });

  prov.eq(new Set(["b@/file.ts"]), g.getDirectDepsRaw("b#/file2.ts"));

  prov.eq(new Set(["b#/file2.ts"]), g.getCpImpact("b@/file.ts"));

  prov.eq(new Set(["b@/file.ts"]), g.getDirectImpact("b", "/file.ts"));
};
