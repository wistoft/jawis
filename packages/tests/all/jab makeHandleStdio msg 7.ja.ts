import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//two messages on same line

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123456[1]\x1F\n123456[2]\x1F"));
};
