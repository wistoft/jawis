import { TestProvision } from "^jarun";
import { getTsProjectPath } from "^tests/_fixture/index";
import { getTsPlugin } from "^tests/_fixture";

//compile error in file

export default async (prov: TestProvision) => {
  const { manager } = getTsPlugin(prov, getTsProjectPath());

  return manager.getDiagnostics(getTsProjectPath("helloTsError.ts"));
};
