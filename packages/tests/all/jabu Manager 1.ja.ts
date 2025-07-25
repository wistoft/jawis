import { TestProvision } from "^jarun";
import { getManager } from "^tests/_fixture/index";

export default async (prov: TestProvision) => {
  const manager = getManager(prov);

  return manager.shutdown();
};
