import { TestProvision } from "^jarun";
import { getDtpController } from "../_fixture";

//hello

export default (prov: TestProvision) => {
  const dtp = getDtpController({
    "/a.ts": `export const a = '';
              `,
    "/1.ts": `import {a} from "/a"
              `,
  });

  const tests = new Map([["/1.ts", -1]]);

  //nothing to test, when nothing changed

  prov.eq([], dtp.getTests_pure([], [], tests));

  //test is selected, when it changes

  prov.eq([["1.ts"]], dtp.getTests_pure([], ["/1.ts"], tests));
};
