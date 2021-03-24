import { Application } from "express";
import http from "http";

import { Socket } from "net";

export type Deps = {
  port: number;
  app: Application;
  log: (msg: string) => void;
  onError: (error: unknown) => void;
  onOpen: () => void;
  onClose: () => void;
};

/**
 *
 */
export class Server {
  public server: http.Server;
  public sockets: Set<Socket> = new Set();

  protected state: "opening" | "running" | "stopping" | "stopped";

  // true, when the server has emitted close, but not all sockets have.
  private waitingForSocketsToClose = false;
  private shutdownListener?: () => void;

  /**
   *
   */
  constructor(private deps: Deps) {
    this.server = deps.app.listen(deps.port, () => {
      this.deps.log("listen callback");
      this.state = "running";
      // console.log("server open");
    });

    // console.log("server port: " + deps.port);

    //
    // internal handlers
    //

    this.server.on("connection", (socket) => {
      this.deps.log("socket open");

      this.sockets.add(socket);

      socket.on("end", () => {
        this.deps.log("socket end");
      });

      socket.on("close", this.onSocketClose(socket));
    });

    this.server.on("close", this.onServerClose);

    // done

    this.state = "opening";
  }

  public getState = () => this.state;

  /**
   * should wait for conformation
   */
  public killIfRunning = () =>
    new Promise<void>((resolve) => {
      if (this.state !== "stopped") {
        this.deps.log("Had to kill server.");

        // destroy sockets.
        this.sockets.forEach((socket) => {
          socket.destroy();
        });

        this.server.close();

        // async
        this.shutdownListener = resolve;
      } else {
        resolve();
      }
    });

  /**
   *
   */
  public shutdown = () =>
    new Promise<void>((resolve) => {
      if (this.state !== "running") {
        throw new Error("Server not running.");
      }
      this.state = "stopping";

      this.shutdownReal();

      // async
      this.shutdownListener = resolve;
    });

  /**
   *
   */
  private shutdownReal = () => {
    // sockets

    this.sockets.forEach((socket) => {
      socket.end();
    });

    // server

    this.server.close();
  };

  /**
   *
   */
  private onServerClose = () => {
    if (this.sockets.size === 0) {
      this.onActualClose();
    } else {
      this.waitingForSocketsToClose = true;
    }
  };

  /**
   *
   */
  private onSocketClose = (socket: Socket) => () => {
    if (this.sockets.has(socket)) {
      this.deps.log("socket closes");
      this.sockets.delete(socket);
    } else {
      this.deps.log("socket closes again");
    }

    // check if everything is closed
    if (this.waitingForSocketsToClose && this.sockets.size === 0) {
      this.onActualClose();
    }
  };

  /**
   *
   */
  private onActualClose = () => {
    this.deps.log("server close");
    this.state = "stopped";

    if (this.shutdownListener) {
      this.shutdownListener();
    }
  };
}
