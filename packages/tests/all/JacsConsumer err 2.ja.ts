import { TestProvision } from "^jarun";
import { getConsumer } from "../_fixture";

// compile when already compiling

export default (prov: TestProvision) => {
  const holder: any = {};

  const { consumer } = getConsumer(prov, { wait: () => holder.wait() });

  holder.wait = () => {
    consumer.compile("second file");

    return "timed-out";
  };

  consumer.compile("some file");
};
//
