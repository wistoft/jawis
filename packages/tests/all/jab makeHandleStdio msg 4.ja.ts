import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//stdout and message in one buffer

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("hej\n123456{}\x1F"));
};
