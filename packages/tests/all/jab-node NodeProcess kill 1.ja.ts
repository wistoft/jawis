import { TestProvision } from "^jarun";

import { getNodeProcess_ready } from "../_fixture";

// double kill is okay

export default (prov: TestProvision) =>
  getNodeProcess_ready(prov).then((proc) => proc.kill().then(proc.kill));
