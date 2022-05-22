import { runScaleExp } from "^misc";
import { mainProvToConsole } from "^jab-node";

import { getScriptPath, getJabTsProcess } from "^tests/_fixture";

//starting no-op process (with ts-node)

const mainProv = mainProvToConsole();

runScaleExp({
  maxtime: 2000,
  runExp: () => {
    const proc = getJabTsProcess(mainProv, {
      filename: getScriptPath("silent.js"),
    });

    return proc.waiter.await("stopped");
  },
}).then((res) => {
  console.log(res);
});
