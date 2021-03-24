import { TestProvision } from "^jarun";

import { getJabProcess_ready } from "../_fixture";

// double kill is okay

export default (prov: TestProvision) =>
  getJabProcess_ready(prov).then((proc) => proc.kill().then(proc.kill));
