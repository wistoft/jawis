import { startJaviTest } from "^javi";
import { MainProv } from "^jab-node";
import { mainWrapper } from "^main-wrapper";

import { makeDevDeps } from "./makeDevDeps";
import { tos } from "^jab";

const sendBeeLog = (msg: any) => {
  console.log("javi-test onLog");
  console.log(tos(msg));
};

const mainInner = () => async (mainProv: MainProv) => {
  const deps = await makeDevDeps(sendBeeLog, mainProv);

  startJaviTest(deps);
};

//must be able to run in the CLI, so can't export a main function

mainWrapper({
  main: mainInner(),
});
