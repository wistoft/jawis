import {
  getWorkerData,
  uninstallLiveJacs,
} from "../_fixture/testFixtures/jacs";
import { install } from "^jacs";
import { def } from "^jab";

uninstallLiveJacs();

//can set custom import alias

const data = getWorkerData();

def(data.tsPaths).paths["myPrefix/*"] = ["./packages/*"];

install(data);

require("myPrefix/jab");
