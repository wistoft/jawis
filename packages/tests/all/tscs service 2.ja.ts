import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture/index";
import { getTsCompileServiceIncremental } from "^tests/_fixture";
import { err } from "^jab";

//compile error in file

export default async (prov: TestProvision) => {
  const tscs = getTsCompileServiceIncremental(prov);

  return tscs.load(getTsProjectPath("helloTsError.ts")).then(
    () => err("unreach"),
    (error: any) => {
      prov.chk(error.message.includes("TS2322"));
    }
  );
};
