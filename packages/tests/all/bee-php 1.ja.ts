import { TestProvision } from "^jarun";
import { makePhpBee_test } from "../_fixture";

export default (prov: TestProvision) => {
  const proc = makePhpBee_test(prov);

  return (proc as any).proc.waiter.await("stopped");
};
