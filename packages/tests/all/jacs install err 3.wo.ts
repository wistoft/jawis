import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install } from "^jacs";

uninstallLiveJacs();

//throw if absBaseUrl is set, but not pahts

install(getWorkerData({ paths: undefined }));
