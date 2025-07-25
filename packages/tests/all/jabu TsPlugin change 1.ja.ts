import fse from "fs-extra";
import { TestProvision } from "^jarun";
import {
  getScratchPath,
  getScriptPath,
  getTsProjectPath,
} from "^tests/_fixture/index";
import { getTsPlugin } from "^tests/_fixture";

//file is updated from success to error

export default async (prov: TestProvision) => {
  const { manager, pfs } = getTsPlugin(prov, getScratchPath());

  const file = getScratchPath("tmp-file.ts");

  //first

  fse.copyFileSync(getScriptPath("helloTs.ts"), file);

  pfs.emitFileChange(file);

  prov.imp(manager.getDiagnostics(file));

  //change

  fse.copyFileSync(getTsProjectPath("helloTsError.ts"), file);

  pfs.emitFileChange(file);

  //second

  return manager.getDiagnostics(file);
};
