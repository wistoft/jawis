import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install } from "^jacs";

uninstallLiveJacs();

//throw if paths is set, but not absBaseUrl

install(getWorkerData({ absBaseUrl: undefined }));
