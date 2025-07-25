import { InMemoryBee, BeeDeps, MakeBee } from "^bee-common";
import { capture } from "^jab";

import { getBeeDeps, TestMainProv } from ".";

export const getInMemoryBee = <MR = {}>(
  prov: TestMainProv,
  extraDeps?: Partial<BeeDeps<MR>>
) => makeDormentInMemoryBee(getBeeDeps(prov, extraDeps));

/**
 *
 */
export const makeDormentInMemoryBee: MakeBee = <MR extends {}>(
  deps: BeeDeps<MR>
) => {
  if (deps.def.data) {
    throw new Error("data not impl");
  }

  if (deps.def.next) {
    throw new Error("next not impl");
  }

  return new InMemoryBee(deps, {
    onSend: () => {
      deps.onError(new Error("It's winter"));
    },
  });
};

/**
 *
 */
export const makeHelloBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.deps.onStdout(Buffer.from("hello"));
      bee.terminate();
    },
  });

/**
 *
 */
export const makeAngryBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.deps.onStderr(Buffer.from("Bzzzz 🐝"));
    },
  });

/**
 * Send a message, and exits.
 */
export const makeMessageBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.sendBack({ type: "okay, bye" } as any);
    },
  });

/**
 * Send a message, and waits.
 */
export const makeReadyBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.sendBack({ type: "ready" } as any);
    },
  });

/**
 *
 */
export const makeFailingBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.deps.onError(new Error("failed"));
    },
  });

/**
 *
 */
export const makeLoggingBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.deps.onLog({ type: "log", data: [capture("hello")] });
    },
  });

/**
 *
 */
class Unstoppable extends InMemoryBee<any, any> {
  public shutdown = () => {
    if (this.waiter.is("stopped")) {
      //to allow the bee to be killed, and the bee handler knows it's killed.
      return Promise.resolve();
    }
    return new Promise<void>(() => {});
  };
}

/**
 *
 */
export const makeUnstoppableBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new Unstoppable(deps, {
    onInit: (bee) => {
      bee.deps.onStdout(Buffer.from("try and stop me"));
    },
  });

/**
 *
 */
export const makeGracefulBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    requireGracefulShutdown: true,
  });
