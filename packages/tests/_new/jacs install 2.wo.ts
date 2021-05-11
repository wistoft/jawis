import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install } from "^jacs";

uninstallLiveJacs();

//can set custom import alias

install(getWorkerData({ paths: { "myPrefix/*": ["./packages/*"] } }));

require("myPrefix/jab");
