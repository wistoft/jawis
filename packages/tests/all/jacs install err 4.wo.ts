import { install } from "^jacs";
import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";

uninstallLiveJacs();

//absBaseUrl must exist

install(getWorkerData({ tsPaths: { baseUrl: "dontExist" } } as any));
