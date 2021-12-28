import path from "path";
import { readFileSync } from "fs";
import { Client } from "ssh2";

import {
  BeeEvents,
  BeeStates,
  escapeBashArgument,
  Waiter,
  BeeDeps,
} from "^jab";

type Deps<MR extends {}> = {
  conn: Client;
  beeDeps: BeeDeps<MR>;
};

/**
 * Not quite a bee.
 *  - Doesn't support IPC.
 *  - Doesn't support logging.
 *  - There's no support for loading code from development machine.
 *  - Not guaranteed to kill properly.
 *  - But supports stdin.
 *
 * impl
 *  - uses a booter script, to avoid sending all javascript code as cli argument.
 */
export class SshProtoBee<MR extends {}> {
  public waiter: Waiter<BeeStates, BeeEvents>;
  private stream: any;
  private isCloseStreamCalled = false;

  /**
   *
   */
  constructor(public deps: Deps<MR>) {
    //must be first, because listeners depend on it.

    this.waiter = new Waiter({
      onError: deps.beeDeps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //ensure clean shutdown

    this.deps.beeDeps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  public write = (str: string) => {
    if (!this.stream) {
      throw new Error("not impl - when stream not ready");
    }

    this.stream.write(str);
  };

  /**
   *
   */
  public onReady = () => {
    const bootCode = readFileSync( path.join(__dirname, "./sshBooter.js") ).toString(); // prettier-ignore

    const shellCode = "node -e $'" + escapeBashArgument(bootCode) + "'";

    const shouldWaitForContinue = this.deps.conn.exec(
      shellCode,
      (error, stream) => {
        this.stream = stream;

        if (error) {
          this.deps.beeDeps.onError(error);
        } else {
          const beeCode = readFileSync( this.deps.beeDeps.filename ).toString(); // prettier-ignore
          stream.write(beeCode + "\x00");
        }

        stream.on("close", this.closeStream);

        stream.on("data", (data: any) => {
          this.deps.beeDeps.onStdout(data);
        });

        stream.stderr.on("data", (data) => {
          this.deps.beeDeps.onStderr(data);
        });
      }
    );

    if (shouldWaitForContinue === false) {
      console.log("should should wait continue to send more traffic");
    }
  };

  /**
   *
   */
  public onExit = (status: number | null) => {
    this.waiter.set("stopped");

    this.deps.beeDeps.onExit(status);
  };

  /**
   *
   */
  public closeStream = () => {
    if (this.isCloseStreamCalled) {
      console.log("closeStream() - close stream already called.");
    }

    this.isCloseStreamCalled = true;

    this.onExit(0);
  };

  /**
   *
   */
  public shutdown = () => this.waiter.shutdown(this.realKill);

  public noisyKill = () => this.waiter.noisyKill(this.realKill, "SshShellBee");

  public kill = () => this.waiter.kill(this.realKill);

  public is = (state: BeeStates) => this.waiter.is(state);

  private realKill = () => {
    //this is killing the beehive, bees are are just killed/shutdown by sending a message.

    if (this.stream) {
      //works - when the process closes on stdin end.
      //But if the process is in a while loop, it wont react to that. So this doesn't kill.
      this.stream.close();

      //works the same way
      // this.deps.conn.end();
    } else {
      //todo: wait for stream to be ready.
      console.log("has no stream, cannot kill");
    }
  };
}
