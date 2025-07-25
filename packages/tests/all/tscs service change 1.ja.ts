import fse from "fs-extra";
import { TestProvision } from "^jarun";
import {
  getScratchPath,
  getScriptPath,
  getTsProjectPath,
} from "^tests/_fixture/index";
import { getTsCompileServiceIncremental } from "^tests/_fixture";
import { err } from "^jab";

//file is updated from success to error

export default async (prov: TestProvision) => {
  const tscs = getTsCompileServiceIncremental(prov);

  const file = getScratchPath("tmp-file.ts");

  //first

  fse.copyFileSync(getScriptPath("helloTs.ts"), file);

  const code = await tscs.load(file);

  eval(code);

  //change

  fse.copyFileSync(getTsProjectPath("helloTsError.ts"), file);
  tscs.onFileChange(file);

  //second

  return tscs.load(file).then(
    () => err("unreach"),
    (error: any) => {
      prov.chk(error.message.includes("TS2322"));
    }
  );
};
