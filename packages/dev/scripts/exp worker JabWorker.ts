import { runScaleExp } from "^jawis-mess";
import { mainProvToConsole } from "^jab-node";

import { getScriptPath, getJabWorker } from "^tests/_fixture";

//starting no-op worker

const mainProv = mainProvToConsole();

runScaleExp({
  maxtime: 2000,
  runExp: () => {
    const proc = getJabWorker(mainProv, {
      filename: getScriptPath("silent.js"),
    });

    return proc.waiter.await("stopped");
  },
}).then((res) => {
  console.log(res);
});
