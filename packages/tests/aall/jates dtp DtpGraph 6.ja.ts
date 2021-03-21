import { TestProvision } from "^jarun";
import { getDtpGraph } from "../_fixture";

//reexport all

export default (prov: TestProvision) => {
  const g = getDtpGraph({
    "/file.ts": ``,
    "/file2.ts": `export * from "/file"
                  `,
  });

  // the graph entries are on file level

  prov.eq(new Set(["/file.ts"]), g.reExportAllDeps.get("/file2.ts"));
  prov.eq(new Set(["/file2.ts"]), g.reExportAllImpact.get("/file.ts"));

  // a 'virtual' variable is impacted.

  prov.eq(["a@/file2.ts"], g.getReExportAllImpact("a", "/file.ts"));
};
