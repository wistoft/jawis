import { TestProvision } from "^jarun";

import { getNodeProcess } from "../_fixture";

// when cwd is garbage

export default (prov: TestProvision) => {
  const proc = getNodeProcess(prov, {
    cwd: "$",
    onError: () => {
      throw new Error("Should not be called, when a waiter i active.");
    },
    onExit: () => prov.imp("onExit"),
  });

  return proc.waiter.await("stopped").catch((error) => {
    console.log(error.code);
  });
};
