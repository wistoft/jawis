import { TestProvision } from "^jarun";
import { getConsumer } from "../_fixture";

// compile after timeout

export default (prov: TestProvision) => {
  const { consumer } = getConsumer(prov, { wait: () => "timed-out" });

  prov.catch(() => consumer.compile("some file"));
  consumer.compile("some file");
};
//
