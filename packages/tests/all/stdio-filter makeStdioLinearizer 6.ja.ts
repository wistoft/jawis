import { TestProvision } from "^jarun";

import { stdioLinearizerWithFlushForTest } from "^tests/_fixture";

export default (prov: TestProvision) => {
  //
  // auto-flush.
  //

  prov.res("x", stdioLinearizerWithFlushForTest("x"));
  prov.res("x\n", stdioLinearizerWithFlushForTest("x\na"));

  //buffered data ("a") is ignored, and doesn't need to be flushed.
  //  when additioanal data comes, it turns out, that "ay" is not ignored
  //  and it is outputted
  prov.res("x\nay\n", stdioLinearizerWithFlushForTest(["x\na", "y\n"]));

  prov.res("xy", stdioLinearizerWithFlushForTest(["x", "y"]));
};
