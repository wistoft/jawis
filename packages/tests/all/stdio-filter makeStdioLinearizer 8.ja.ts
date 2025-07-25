import { TestProvision } from "^jarun";

import { stdioLinearizerWithFlushForTest } from "^tests/_fixture";

//partial emitted lines.

export default (prov: TestProvision) => {
  prov.res("xy", stdioLinearizerWithFlushForTest(["x", "y"]));
  prov.res("xy\n", stdioLinearizerWithFlushForTest(["x", "y\n"]));
  prov.res("xy\nz", stdioLinearizerWithFlushForTest(["x", "y\nz"]));
  prov.res("xy\nz\n", stdioLinearizerWithFlushForTest(["x", "y\nz\n"]));
  prov.res("xy\nz\næ", stdioLinearizerWithFlushForTest(["x", "y\nz\næ"]));

  prov.res("x", stdioLinearizerWithFlushForTest(["x", ""]));
  prov.res("x\n", stdioLinearizerWithFlushForTest(["x", "\n"]));
  prov.res("x\nz", stdioLinearizerWithFlushForTest(["x", "\nz"]));
  prov.res("x\nz\n", stdioLinearizerWithFlushForTest(["x", "\nz\n"]));
  prov.res("x\nz\næ", stdioLinearizerWithFlushForTest(["x", "\nz\næ"]));

  prov.res("x\n", stdioLinearizerWithFlushForTest(["x", "\na"]));
  prov.res("xy\n", stdioLinearizerWithFlushForTest(["x", "y\na"]));
  prov.res("xy\nz\n", stdioLinearizerWithFlushForTest(["x", "y\nz\na"]));
  prov.res("x\nz\n", stdioLinearizerWithFlushForTest(["x", "\nz\na"]));
  prov.res(
    "x\nz\næa\n",
    stdioLinearizerWithFlushForTest(["x", "\nz\næ", "a\n"])
  );

  //when a pseudo line is shown. Then the rest of the line will always be shown.
  // Even if sub matches are ignored.

  prov.res("xa", stdioLinearizerWithFlushForTest(["x", "a"]));
  prov.res("xaa", stdioLinearizerWithFlushForTest(["x", "a", "a"]));

  prov.res("xa\n", stdioLinearizerWithFlushForTest(["x", "a\n"]));
  prov.res("xaa\n", stdioLinearizerWithFlushForTest(["x", "a", "a\n"]));

  // Also if the final line is ignored. It's just bad luck.

  prov.res(
    "xaa\n",
    stdioLinearizerWithFlushForTest(["x", "a", "a\n"], (line) => line !== "xaa")
  );
};
