import { TestProvision } from "^jarun";

import { getComposedTestFramework } from "../_fixture";
import { safeFinally } from "^jab";

export default (prov: TestProvision) => {
  const tf = getComposedTestFramework(prov);

  const prom = tf.getTestIds().then(prov.imp);

  return safeFinally(prom, tf.kill, prov.onError);
};
