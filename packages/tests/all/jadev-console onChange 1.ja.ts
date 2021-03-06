import { TestProvision } from "^jarun";

import { getConsoleFire } from "../_fixture";
import { sleeping } from "^jab";

//two events are batch together, when they are close (in time)

export default ({ imp }: TestProvision) => {
  const { fire } = getConsoleFire(imp);

  fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });
  fire({ type: "log", context: "browser", logName: "myLog", data: ["dav"] });

  return sleeping(100);
};
