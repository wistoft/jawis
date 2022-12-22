import { install } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";

uninstallLiveJacs();

//double install

install(getWorkerData());
install(getWorkerData());
