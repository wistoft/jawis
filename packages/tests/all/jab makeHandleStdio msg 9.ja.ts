import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//revealed bug

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("\n\n123456{}\x1F"));
};
