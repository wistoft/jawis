import { TestProvision } from "^jarun";

import { safeFinally } from "^yapu";
import { getComposedTestFramework } from "../_fixture";

export default (prov: TestProvision) => {
  const tf = getComposedTestFramework(prov);

  const prom = tf
    .getTestIds()
    .then((data) => data.map((str) => str.replace(/\\/g, "/")))
    .then(prov.imp);

  return safeFinally(prom, tf.kill, prov.onError);
};
