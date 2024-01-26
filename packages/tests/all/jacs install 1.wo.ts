import { install, uninstall } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";

uninstallLiveJacs();

//test install

install(getWorkerData({ stackTraceLimit: 5 }));

console.log(JSON.stringify(Error.stackTraceLimit));

//again

uninstall();

install(getWorkerData({ stackTraceLimit: 7 }));

console.log(JSON.stringify(Error.stackTraceLimit));
