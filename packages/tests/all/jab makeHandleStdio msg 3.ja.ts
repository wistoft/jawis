import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//stdout after message

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123456"));
  onStdout(Buffer.from("{}\x1F")); //the message
  onStdout(Buffer.from("hello"));
};
