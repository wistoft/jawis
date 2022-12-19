import { TestProvision } from "^jarun";

import { getConsoleFire } from "../_fixture";
import { sleeping } from "^yapu";

//no callback attached.

export default ({ imp }: TestProvision) => {
  const { fire, captureCache } = getConsoleFire();

  fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });

  return sleeping(100).then(() => {
    //the is still in the cache.
    imp(captureCache);
  });
};
