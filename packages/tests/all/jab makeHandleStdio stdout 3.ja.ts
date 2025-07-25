import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//start-token cancelled after exit

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("dav\n"));
  onStdout(Buffer.from("igen"));
};
