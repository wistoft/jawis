import { TestProvision } from "^jarun";
import { getConsumer } from "../_fixture";

// compile succeeds

export default (prov: TestProvision) => {
  const { consumer } = getConsumer(prov);

  return consumer.compile("some file");
};
