import { DefaultHoneyComb, HoneyComb } from "^bee-common";

import {
  getLiveMakeJacsWorker,
  makeAngryBee,
  makeDormentInMemoryBee,
  makeFailingBee,
  makeGracefulBee,
  makeHelloBee,
  makeLoggingBee,
  makeMessageBee,
  makeReadyBee,
  makeUnstoppableBee,
} from ".";

export const getTestHoneyComb2 = (): HoneyComb<"ts"> => {
  const makeTsBee = getLiveMakeJacsWorker();

  return new DefaultHoneyComb({
    certainBees: new Map([["ts", makeTsBee]]),
    suffixBees: new Map([
      ["dormitory.bee", makeDormentInMemoryBee],
      ["hello.bee", makeHelloBee],
      ["angry.bee", makeAngryBee],
      ["message.bee", makeMessageBee],
      ["ready.bee", makeReadyBee],
      ["failing.bee", makeFailingBee],
      ["logging.bee", makeLoggingBee],
      ["unstoppable.bee", makeUnstoppableBee],
      ["graceful.bee", makeGracefulBee],
    ]),
  });
};
