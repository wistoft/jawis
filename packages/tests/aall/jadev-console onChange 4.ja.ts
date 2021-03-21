import { TestProvision } from "^jarun";

import { getConsoleFire } from "../_fixture";
import { sleeping } from "^jab";

//when exceeding max entries, data should not be emitted.

export default ({ imp }: TestProvision) => {
  const { fire, captureCache } = getConsoleFire(imp);

  for (let i = 0; i < 10; i++) {
    fire({ type: "log", context: "browser", logName: "myLog", data: ["hej"] });
  }

  return sleeping(100)
    .then(() => {
      //extra data, that should not be emitted.
      for (let i = 0; i < 10; i++) {
        fire({
          type: "log",
          context: "browser",
          logName: "myLog",
          data: ["extra"],
        });
      }

      return sleeping(100);
    })
    .then(() => {
      // the extra data is here. Not emitted.
      imp(captureCache);
    });
};
