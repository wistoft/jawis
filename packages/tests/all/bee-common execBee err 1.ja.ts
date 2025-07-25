import { TestProvision } from "^jarun";
import {
  execBeeGetPrettyErrors,
  getLiveMakeJacsWorker,
  getScriptPath,
} from "^tests/_fixture";

//executable doesn't exist

export default async (prov: TestProvision) => {
  const res = await execBeeGetPrettyErrors({
    def: { filename: getScriptPath("lasdjkf") },
    finallyFunc: prov.finally,
    makeBee: getLiveMakeJacsWorker(),
  });

  prov.chk(res.errors[0].msg.includes("Cannot find module"));
};
