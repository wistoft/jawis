import { startJaviTest } from "^javi";
import { MainProv } from "^jab-node";
import { mainWrapper } from "^main-wrapper";
import { tos } from "^jab";

import { makeDevDeps } from "./makeDevDeps";
import { getPackagePath } from "^dev/project.conf";

let extraConf = {};
let extraServiceConfig = {};

if (process.env["DEV_SELF_TEST"] === "true") {
  extraConf = {
    testFolder: getPackagePath("tests"),
    testLogFolder: getPackagePath("tests/_testLogs"),
  };

  extraServiceConfig = { "@jawis/jates/tecTimeout": 30000 };
}

const sendBeeLog = (msg: any) => {
  console.log("javi-test onLog");
  console.log(tos(msg));
};

const mainInner = () => async (mainProv: MainProv) => {
  const deps = await makeDevDeps(
    sendBeeLog,
    mainProv,
    extraConf,
    extraServiceConfig
  );

  startJaviTest(deps);
};

//must be able to run in the CLI, so can't export a main function

mainWrapper({
  main: mainInner(),
});
