import { TestProvision } from "^jarun";

import { getStdProcess } from "../_fixture";

// executable doesn't exist

export default async (prov: TestProvision) => {
  const proc = getStdProcess(prov, {
    filename: "dontExist",
  });

  try {
    await proc.waiter.await("stopped");
  } catch (error) {
    prov.onError(error);
  }

  return proc.kill();
};
