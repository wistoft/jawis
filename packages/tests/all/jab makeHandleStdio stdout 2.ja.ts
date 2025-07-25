import { TestProvision } from "^jarun";
import { makeHandleStdio_test } from "../_fixture";

//start token partial cancelled (without exit)

export default (prov: TestProvision) => {
  const onStdout = makeHandleStdio_test(prov);

  onStdout(Buffer.from("hej\ndav"));
};
