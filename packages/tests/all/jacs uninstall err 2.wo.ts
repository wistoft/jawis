import { install, uninstall } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";

uninstallLiveJacs();

//double uninstall

install(getWorkerData());

uninstall();
uninstall();
