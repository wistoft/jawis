import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getConsoleFire } from "../_fixture";

//two events are in their own "catch", when separated in time.

export default ({ imp }: TestProvision) => {
  const { fire } = getConsoleFire(imp);

  fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });

  return sleeping(100).then(() => {
    fire({ type: "log", context: "browser", logName: "myLog", data: ["dav"] });

    return sleeping(100);
  });
};
