import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//reexport named

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": ``,
    "/file2.ts": `export {a} from "/file"
                  `,
  });

  //reexport impacts an external variable

  prov.eq(new Set(["a@/file2.ts"]), g.getCodePieceImpact("a@/file.ts"));

  prov.eq(new Set(["a@/file.ts"]), g.getDirectDepsRaw("a@/file2.ts"));
};
