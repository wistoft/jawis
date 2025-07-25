import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//second message is split up.

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123456[1]\x1F\n123"));
  onStdout(Buffer.from("456[2]\x1F"));
};
