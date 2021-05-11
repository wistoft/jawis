import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install, uninstall } from "^jacs";

uninstallLiveJacs();

//double uninstall

install(getWorkerData());

uninstall();
uninstall();
