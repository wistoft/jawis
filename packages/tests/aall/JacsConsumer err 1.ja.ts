import { TestProvision } from "^jarun";
import { getConsumer } from "../_fixture";

// compile timeout

export default (prov: TestProvision) => {
  const { consumer } = getConsumer(prov, { wait: () => "timed-out" });

  consumer.compile("some file");
};
