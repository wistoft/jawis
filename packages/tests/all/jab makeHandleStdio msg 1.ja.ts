import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//a message in one buffer

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123456{}\x1F"));
};
