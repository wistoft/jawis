import { TestProvision } from "^jarun";

import { sleeping } from "^yapu";
import { getProcessRestarter_running, getScriptPath } from "../_fixture";

export default async (prov: TestProvision) => {
  const jpr = await getProcessRestarter_running(prov, {
    def: { filename: getScriptPath("hello.js") },
  });

  jpr.send({ type: "shutdown" });

  await sleeping(10);

  await jpr.kill();
};
