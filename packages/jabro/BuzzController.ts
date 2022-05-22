import { assertNever, err, BeeDeps, MakeBee } from "^jab";

import { BeeFrostClientMessage, BeeFrostServerMessage } from "^jabroc";
import { BeeShell } from "./BeeShell";

type Deps = {
  ymerUrl: string;
  send: (msg: BeeFrostServerMessage) => Promise<void>;
};

/**
 * Control the abstact bee hive by sending/receiving messages.
 *
 * - The channel is abstract (beefrost).
 * - Bees can be created and kill remotely, as expected.
 * - The bee in-/output is multiplexed over the channel.
 * - Ensures the messages from the remote bees are relayed correctly. I.e. to the right BeeShell.
 */
export class BuzzController {
  private shells: Map<string, BeeShell<any, any>> = new Map();

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
    if (beeDeps.def.data) {
      throw new Error("data not impl");
    }

    if (beeDeps.def.next) {
      throw new Error("next not impl");
    }

    const fileUrl = beeDeps.def.filename; //quick fix. filename is missleading. Maybe fileUrl is better.

    //check

    if (this.shells.has(fileUrl)) {
      err("Bee with this name already exists.", beeDeps.def.filename);
    }

    //intercept stuff

    const onExit = (status: number | null) => {
      this.shells.delete(fileUrl);
      beeDeps.onExit(status);
    };

    //start

    const shell = new BeeShell<MR, MS>({
      fileUrl,
      beeDeps: { ...beeDeps, onExit },
      send: this.deps.send,
    });

    this.deps.send({
      type: "makeBee",
      fileUrl,
      ymerUrl: this.deps.ymerUrl,
    });

    //store

    this.shells.set(fileUrl, shell);

    //return

    return shell;
  };

  /**
   * Recieves messages from beefrost.
   */
  public onMessage = (msg: BeeFrostClientMessage) => {
    const shell = this.shells.get(msg.fileUrl);

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
        shell.onExit(msg.data);
        break;

      default:
        assertNever(msg, "Unknown message.");
    }
  };
}
