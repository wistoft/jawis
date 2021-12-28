import { MakeBee } from "^jabc";
import { BuzzController } from "^jabro";
import { BuzzChannel, BuzzStoreProv } from "^jabroc";

type Deps = {
  ymerUrl: string;
};

/**
 * Stores connections to hives, which register/unregister themselves.
 *
 *  - A hive can create bees.
 *  - It's controlled by message passing.
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
    const buzzController = new BuzzController({
      ymerUrl: this.deps.ymerUrl,
      send: channel.send,
    });

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
