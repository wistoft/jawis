import { runScaleExp } from "^misc";

import { getScriptPath } from "^tests/_fixture";

import { getJacsBee } from "../util/bee";

//start no-op worker (with jacs)

runScaleExp({
  maxtime: 2000,
  runExp: () => {
    const proc = getJacsBee({
      filename: getScriptPath("silent.js"),
      // filename: path.join(__dirname, "util/helloJab.ts"),
    });

    return proc.waiter.await("stopped");
  },
}).then((res) => {
  console.log(res);
});
