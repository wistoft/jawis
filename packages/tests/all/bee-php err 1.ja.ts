import { TestProvision } from "^jarun";
import { getScriptPath, makePhpBee_test } from "../_fixture";

export default (prov: TestProvision) => {
  const proc = makePhpBee_test(prov, {
    def: { filename: getScriptPath("parse-error.php") },
  });

  return (proc as any).proc.waiter.await("stopped");
};
