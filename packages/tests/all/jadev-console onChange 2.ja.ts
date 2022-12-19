import { TestProvision } from "^jarun";

import { getConsoleFire } from "../_fixture";
import { sleeping } from "^yapu";

//two events are in their own "catch", when separated in time.

export default ({ imp }: TestProvision) => {
  const { fire } = getConsoleFire(imp);

  fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });

  return sleeping(100).then(() => {
    fire({ type: "log", context: "browser", logName: "myLog", data: ["dav"] });

    return sleeping(100);
  });
};
