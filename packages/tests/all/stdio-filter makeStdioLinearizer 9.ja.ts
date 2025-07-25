import { TestProvision } from "^jarun";

import { stdioLinearizerWithFlushForTest } from "^tests/_fixture";

//partial emitted lines.

export default (prov: TestProvision) => {
  //after partial emit state has ended.

  prov.res("xa\n", stdioLinearizerWithFlushForTest(["x", "a\n", "a"]));
  prov.res("xa\n", stdioLinearizerWithFlushForTest(["x", "a\n", "a\n"]));

  prov.res("xa\n", stdioLinearizerWithFlushForTest(["x", "a\na"]));
  prov.res("xa\n", stdioLinearizerWithFlushForTest(["x", "a\na", "\n"]));

  prov.res("xa\nx\n", stdioLinearizerWithFlushForTest(["x", "a\nx\n", "a"]));
  prov.res("xa\nx\n", stdioLinearizerWithFlushForTest(["x", "a\nx\n", "a\n"]));
};
