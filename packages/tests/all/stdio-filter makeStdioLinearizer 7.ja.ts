import { TestProvision } from "^jarun";

import { stdioLinearizerWithFlushForTest } from "^tests/_fixture";

//all pseudo lines, must be ignored, for a split-up line to be fully ignored.

export default (prov: TestProvision) => {
  prov.res(
    "",
    stdioLinearizerWithFlushForTest(
      ["a", "a\n"],
      (line) => line !== "a" && line !== "aa"
    )
  );

  prov.res(
    "",
    stdioLinearizerWithFlushForTest(
      ["a", "a", "a\n"],
      (line) => line !== "a" && line !== "aa" && line !== "aaa"
    )
  );
};
