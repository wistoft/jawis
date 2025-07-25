import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture/index";
import { getTsCompileServiceNonIncremental } from "^tests/_fixture";
import { err } from "^jab";

//compile error in file

export default (prov: TestProvision) => {
  const tscs = getTsCompileServiceNonIncremental(prov);

  return tscs.load(getTsProjectPath("helloTsError.ts")).then(
    () => err("unreach"),
    (error: any) => {
      prov.chk(error.message.includes("TS2322"));
    }
  );
};
