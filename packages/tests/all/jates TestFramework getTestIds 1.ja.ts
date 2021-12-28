import path from "path";

import { safeFinally } from "^jab";
import { TestProvision } from "^jarun";

import { absTestFolder, getComposedTestFramework } from "../_fixture";

export default (prov: TestProvision) => {
  const tf = getComposedTestFramework(prov);

  const prom = tf
    .getTestIds()
    .then((data) =>
      data.map((id) => ({
        name: id.name.replace(/\\/g, "/"),
        file: path.relative(absTestFolder, id.file).replace(/\\/g, "/"),
      }))
    )
    .then(prov.imp);

  return safeFinally(prom, tf.kill, prov.onError);
};
