import fse from "fs-extra";
import { TestProvision } from "^jarun";
import {
  getScratchPath,
  getScriptPath,
  getTsProjectPath,
} from "^tests/_fixture/index";
import { getTsCompileServiceIncremental } from "^tests/_fixture";
import { err } from "^jab";

//file is updated from error to success

export default async (prov: TestProvision) => {
  const tscs = getTsCompileServiceIncremental(prov);

  const file = getScratchPath("tmp-file.ts");

  //first

  fse.copyFileSync(getTsProjectPath("helloTsError.ts"), file);

  await tscs.load(file).then(
    () => err("unreach"),
    (error: any) => {
      prov.chk(error.message.includes("TS2322"));
    }
  );

  //change

  fse.copyFileSync(getScriptPath("helloTs.ts"), file);
  tscs.onFileChange(file);

  //second

  const code = await tscs.load(file);

  eval(code);
};
