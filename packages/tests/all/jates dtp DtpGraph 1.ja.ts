import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//internal code pieces

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": ` const a = '';
                  const b = a;
                  `,
  });

  prov.eq(undefined, g.getDirectDepsRaw("dontExist#/file.ts"));

  //a has no dependencies

  prov.eq(new Set([]), g.getDirectDepsRaw("a#/file.ts"));

  //a impacts b

  prov.eq(new Set(["b#/file.ts"]), g.getCpImpact("a#/file.ts"));

  //b depends on a

  prov.eq(new Set(["a#/file.ts"]), g.getDirectDepsRaw("b#/file.ts"));

  //b impacts nothing

  prov.eq(undefined, g.getCpImpact("b#/file.ts"));
};
