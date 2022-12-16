import { objOmit } from "^jab";

import { TestProvision } from "^jarun";

export default ({ imp }: TestProvision) => {
  imp(objOmit({}, "hej"));
  imp(objOmit({ hej: "dav", jens: "hans" }, "jens"));
  imp(objOmit({ hej: "dav" }, "dontExist"));

  // undefined is preserved in objects.
  const o = { und: undefined };
  imp(o);
};
