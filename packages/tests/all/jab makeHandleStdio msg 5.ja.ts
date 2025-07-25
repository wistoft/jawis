import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//start-token is split accross Buffers

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123"));
  onStdout(Buffer.from("456{"));
  onStdout(Buffer.from("}\x1F")); //the message
};
