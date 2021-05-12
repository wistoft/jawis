import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install, uninstall } from "^jacs";

uninstallLiveJacs();

//test install

install(getWorkerData({ stackTraceLimit: 5 }));

console.log(Error.stackTraceLimit);

//again

uninstall();

install(getWorkerData({ stackTraceLimit: 7 }));

console.log(Error.stackTraceLimit);
