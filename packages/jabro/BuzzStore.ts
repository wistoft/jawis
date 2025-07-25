import { MakeBee } from "^bee-common";
import { OnErrorData } from "^jab";

import { BuzzChannel, BuzzStoreProv, BuzzController } from "./internal";

type Deps = {
  onErrorData: OnErrorData;
};

/**
 * todo: merge this into makeBrowserBeeFrost.
 */
export class BuzzStore implements BuzzStoreProv {
  private store: Set<BuzzController> = new Set();

  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   * Register the hive, and it becomes available for others to use.
   *
   *  - All the bees are killed, when a hive unregisters.
   */
  public register = (channel: BuzzChannel) => {
    const buzzController = new BuzzController({ ...channel, ...this.deps });

    this.store.add(buzzController);

    return {
      onMessage: buzzController.onMessage,
      unregister: () => {
        this.store.delete(buzzController);

        //And remove all shells.

        buzzController.kill();
      },
    };
  };

  /**
   *
   */
  public tryGetOne = (): MakeBee | undefined => {
    for (const constroller of this.store) {
      //we have one to return.
      return constroller.makeBee;
    }
  };
}
