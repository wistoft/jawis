import { TestProvision } from "^jarun";

import { filterStdioTest, filterStdioWithFlushTest } from "^tests/_fixture";

export default (prov: TestProvision) => {
  //
  // without auto-flush
  //

  prov.eq("", filterStdioTest(""));
  prov.eq("\n", filterStdioTest("\n"));
  prov.eq("", filterStdioTest("a")); //the values is buffered
  prov.eq("", filterStdioTest("c")); //the values is buffered

  prov.eq("", filterStdioTest("a\n"));
  prov.eq("x\n", filterStdioTest("x\n"));
  prov.eq("\n\n", filterStdioTest("\n\n"));

  prov.eq("x\n", filterStdioTest("x\ny")); //the values is buffered
  prov.eq("x\ny\n", filterStdioTest("x\ny\n"));

  //
  // multiple calls
  //

  prov.eq("x\ny\n", filterStdioTest(["x", "\ny\n"]));
  prov.eq("x\ny\n", filterStdioTest(["x", "\n", "y\n"]));
  prov.eq("x\ny\n", filterStdioTest(["x", "\n", "y", "\n"]));
  prov.eq("x\n", filterStdioTest(["x", "\n", "y"])); //the values is buffered

  //
  // auto-flush.
  //

  prov.res("x\n", filterStdioWithFlushTest("x"));
  prov.res("x\n", filterStdioWithFlushTest("x\na"));

  prov.res("x\ny\n", filterStdioWithFlushTest(["x", "y"]));
};
