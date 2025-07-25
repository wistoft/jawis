import { TestProvision } from "^jarun";
import { safeFinally } from "^yapu";
import { filterTestInfo, getComposedTestFramework } from "../_fixture";

export default (prov: TestProvision) => {
  const tf = getComposedTestFramework(prov);

  const prom = tf.getTestInfo().then(filterTestInfo).then(prov.imp);

  return safeFinally(prom, tf.kill, prov.onError);
};
