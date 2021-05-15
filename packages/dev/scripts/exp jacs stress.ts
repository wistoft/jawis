import path from "path";
import { runScaleExp } from "^misc";
import { Process, registerOnMessage, TS_TIMEOUT } from "^jab-node";

import { getJacsBee } from "./util/bee";

//
// hawk resources
//

const procs: Process<any, any>[] = [];

// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));
// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));
// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));
// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));
// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));
// procs.push(jsExecNoisy(path.join(__dirname, "util/i_spin.js")));

//
// graceful
//

const kill = () => {
  for (const proc of procs) {
    proc.kill();
  }
};

registerOnMessage(function () {
  //just kill at any message
  kill();
  process.exit();
});

//
// experiment
//

runScaleExp({
  maxtime: 120000,
  runExp: () => {
    // console.log("start");
    const proc = getJacsBee({
      filename: path.join(__dirname, "util/helloJab.ts"),
    });

    return proc.waiter.await("stopped", 2 * TS_TIMEOUT);
  },
}).then((res) => {
  console.log(res);

  //
  // clean up
  //

  kill();
});
