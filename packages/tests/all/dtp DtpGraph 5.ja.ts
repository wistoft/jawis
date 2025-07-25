import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//reexport name space

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": ``,
    "/file2.ts": `export * as ns2 from "/file"
                  `,
  });

  //reexport impacts an external variable

  prov.eq(new Set(["ns2@/file2.ts"]), g.getNamespaceImpact("/file.ts"));
};
