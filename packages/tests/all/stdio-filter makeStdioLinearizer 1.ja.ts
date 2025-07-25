import { TestProvision } from "^jarun";

import { stdioLinearizerForTest_old } from "^tests/_fixture";

export default (prov: TestProvision) => {
  //
  // without auto-flush
  //

  prov.eq("", stdioLinearizerForTest_old(""));
  prov.eq("\n", stdioLinearizerForTest_old("\n"));
  prov.eq("", stdioLinearizerForTest_old("a")); //the values are buffered
  prov.eq("", stdioLinearizerForTest_old("c")); //the values are buffered

  prov.eq("", stdioLinearizerForTest_old("a\n"));
  prov.eq("x\n", stdioLinearizerForTest_old("x\n"));
  prov.eq("\n\n", stdioLinearizerForTest_old("\n\n"));

  prov.eq("x\n", stdioLinearizerForTest_old("x\ny")); //the values are buffered
  prov.eq("x\ny\n", stdioLinearizerForTest_old("x\ny\n"));

  //
  // multiple calls
  //

  prov.eq("x\ny\n", stdioLinearizerForTest_old(["x", "\ny\n"]));
  prov.eq("x\ny\n", stdioLinearizerForTest_old(["x", "\n", "y\n"]));
  prov.eq("x\ny\n", stdioLinearizerForTest_old(["x", "\n", "y", "\n"]));
  prov.eq("x\n", stdioLinearizerForTest_old(["x", "\n", "y"])); //the values are buffered
};
