import { runScaleExp } from "^jawis-mess";
import { mainProvToConsole } from "^jab-node";

import { getScriptPath, getJabProcess } from "^tests/_fixture";

//starting no-op process

const mainProv = mainProvToConsole();

runScaleExp({
  maxtime: 2000,
  runExp: () => {
    const proc = getJabProcess(mainProv, {
      filename: getScriptPath("silent.js"),
    });

    return proc.waiter.await("stopped");
  },
}).then((res) => {
  console.log(res);
});
