import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//import named

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": `export {b};
                  `,
  });

  //exported variable depends on the internal.

  prov.eq(new Set(["b#/file.ts"]), g.getDirectDepsRaw("b@/file.ts"));

  prov.eq(new Set(["b@/file.ts"]), g.getCpImpact("b#/file.ts"));
};
