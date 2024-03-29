import { install, uninstall } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";

uninstallLiveJacs();

//compiles fine, when installed.

install(getWorkerData());

require("^jab");

//can't compile after uninstall

uninstall();

try {
  require("^jab");
  console.log("expected to throw");
  // eslint-disable-next-line no-empty
} catch (error) {}
