import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install } from "^jacs";

uninstallLiveJacs();

//absBaseUrl must exist

install(getWorkerData({ tsPaths: { baseUrl: "dontExist" } } as any));
