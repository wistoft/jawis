import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//message isn't valid json

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n123456blabla\x1F"));
};
