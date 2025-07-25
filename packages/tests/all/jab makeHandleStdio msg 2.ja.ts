import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//message is split accross Buffers

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("hej\n123456"));
  onStdout(Buffer.from("{}\x1F")); //the message
};
