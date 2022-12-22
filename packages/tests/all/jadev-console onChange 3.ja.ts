import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getConsoleFire } from "../_fixture";

//no callback attached.

export default ({ imp }: TestProvision) => {
  const { fire, captureCache } = getConsoleFire();

  fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });

  return sleeping(100).then(() => {
    //the is still in the cache.
    imp(captureCache);
  });
};
