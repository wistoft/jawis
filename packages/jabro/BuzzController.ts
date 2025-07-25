import { BeeDeps, MakeBee } from "^bee-common";
import { assertNever, err, OnErrorData } from "^jab";

import {
  BeeShell,
  BeeFrostClientMessage,
  BeeFrostServerMessage,
} from "./internal";

type Deps = {
  send: (msg: BeeFrostServerMessage) => void;
  onErrorData: OnErrorData;
};

/**
 * Controls the abstract bee hive by sending/receiving messages.
 *
 * - The channel is abstract.
 * - Bees can be created and killed remotely, as expected.
 * - The bee in-/output is multiplexed over the channel.
 * - Ensures the messages from the remote bees are relayed correctly. I.e. to the right BeeShell.
 */
export class BuzzController {
  private shells: Map<number, BeeShell<any, any>> = new Map();

  private nextBeeId = 1;

  /**
   *
   */
  constructor(private deps: Deps) {}

  /**
   * todo: should also send kill messages to the bee hive. Maybe have a kill-hive message.
   */
  public kill = () => {
    this.shells.forEach((shell) => {
      //maybe a better error message.
      shell.onExit();
    });
  };

  /**
   *
   */
  public makeBee: MakeBee = <MS extends {}, MR extends {}>(
    beeDeps: BeeDeps<MR>
  ) => {
    if (beeDeps.def.data) {
      if (
        typeof beeDeps.def.data !== "object" ||
        Object.keys(beeDeps.def.data).length !== 0
      ) {
        console.log("BuzzController: data not impl", beeDeps.def.data);
      }
    }

    if (beeDeps.def.next) {
      console.log("BuzzController: next not impl", beeDeps.def);
    }

    const bid = this.nextBeeId++; //increments for next bee.

    //intercept stuff

    const onExit = () => {
      this.shells.delete(bid);
      beeDeps.onExit();
    };

    //start

    const shell = new BeeShell<MR, MS>({
      bid,
      beeDeps: { ...beeDeps, onExit },
      send: this.deps.send,
    });

    this.deps.send({
      type: "makeBee",
      bid,
      filename: beeDeps.def.filename,
    });

    //store

    this.shells.set(bid, shell);

    //return

    return shell;
  };

  /**
   * Recieves messages from beefrost.
   */
  public onMessage = (msg: BeeFrostClientMessage) => {
    if (msg.type === "error") {
      this.deps.onErrorData(msg.data);
      return;
    }

    const shell = this.shells.get(msg.bid);

    if (shell === undefined) {
      throw err("Unknown bee", msg);
    }

    switch (msg.type) {
      case "message":
        shell.deps.beeDeps.onMessage(msg.data);
        break;

      case "log":
        shell.deps.beeDeps.onLog(msg.data);
        break;

      case "stdout":
        //todo: bee listener must also take string
        shell.deps.beeDeps.onStdout(Buffer.from(msg.data));
        break;

      case "stderr":
        //todo: bee listener must also take string
        shell.deps.beeDeps.onStderr(Buffer.from(msg.data));
        break;

      case "exit":
        //call onExit on the shell, it's setup so other relevant places are called.
        shell.onExit();
        break;

      default:
        assertNever(msg, "Unknown message.");
    }
  };
}
