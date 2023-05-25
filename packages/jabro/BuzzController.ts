import { BeeDeps, MakeBee } from "^bee-common";
import { assertNever, basename, err } from "^jab";

import {
  BeeShell,
  BeeFrostClientMessage,
  BeeFrostServerMessage,
} from "./internal";

type Deps = {
  send: (msg: BeeFrostServerMessage) => Promise<void>;
};

/**
 * Controls the abstact bee hive by sending/receiving messages.
 *
 * - The channel (beefrost) is abstract.
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
   *
   */
  public kill = () => {
    this.shells.forEach((shell) => {
      //maybe a better error message.
      shell.onExit(1);
    });
  };

  /**
   *
   */
  public makeBee: MakeBee = <MS extends {}, MR extends {}>(
    beeDeps: BeeDeps<MR>
  ) => {
    const bid = this.nextBeeId++; //increments for next bee.

    //intercept stuff

    const onExit = (status: number | null) => {
      this.shells.delete(bid);
      beeDeps.onExit(status);
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
      fileUrl: basename(beeDeps.filename), //todo: send full path.
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
      //quick fix
      console.log(msg.data);
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
        shell.onExit(msg.data);
        break;

      default:
        assertNever(msg, "Unknown message.");
    }
  };
}
