import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("hej"));
  onStdout(Buffer.from("dav"));
};
