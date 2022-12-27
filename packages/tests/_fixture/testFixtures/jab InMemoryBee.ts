import { BeeDeps, InMemoryBee, MakeBee } from "^bee-common";

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
) =>
  new InMemoryBee(deps, {
    onSend: () => Promise.reject(new Error("It's winter")),
  });

/**
 *
 */
export const makeInMemoryHelloBee = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.deps.onStdout(Buffer.from("hello"));
      bee.terminate();
    },
  });

/**
 *
 */
export const makeInMemoryWppMain = <MR extends {}>(deps: BeeDeps<MR>) =>
  new InMemoryBee(deps, {
    onInit: (bee) => {
      bee.sendBack({ type: "ready" } as any);
    },
  });
