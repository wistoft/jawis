import net from "net";

import { FinallyFunc, Waiter } from "^jab";

import { makeOnJsonOverStdout } from ".";

type Deps = {
  pipePath: string;
  onMessage: (data: any) => void;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
};

type States = "running" | "stopping" | "stopped";
type Events = never;

/**
 *
 */
export class NamedPipeServer {
  public waiter: Waiter<States, Events>;

  private server: net.Server;
  private stream?: net.Socket;

  /**
   *
   */
  constructor(public deps: Deps) {
    //must be first, because listeners depend on it.

    this.waiter = new Waiter({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //setup

    this.server = net.createServer((stream) => {
      this.stream = stream;

      const onStdout = makeOnJsonOverStdout(this.deps.onMessage);

      stream.on("data", onStdout);

      stream.on("end", () => {
        //auto close server, when stream is closed by client.
        this.server.close();
      });
    });

    this.server.on("close", () => {
      this.waiter.set("stopped");
    });

    this.server.listen(this.deps.pipePath);

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
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
  public shutdown = () => this.waiter.shutdown(this.realShutdown);

  public noisyKill = () =>
    this.waiter.noisyKill(this.realShutdown, "NamedPipeServer");

  private realShutdown = () => {
    //is this enough?
    this.stream?.end();
    this.server.close();
  };
}
