import WebSocket from "ws";

import { err } from "^jab";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";

import { NodeWSProv } from "./internal";

export type WsUrl = { host: string; port: number; path: string };

type Conf =
  | WsUrl
  | {
      ws: WebSocket;
      startState: States;
    };

export type NodeWsDeps<MsgReceive extends SocketData = SocketData> = Conf & {
  finally: FinallyFunc;
  onError: (error: unknown) => void;
  onOpen: () => void;
  onMessage: (message: MsgReceive) => void;
  onClose: () => void;
};

export type States = "opening" | "running" | "stopping" | "stopped";

export type Events = "data";

//object is supported by json encoding.
// Nothing else supported for now.
export type SocketData = {};

/**
 *  All callbacks mandatory, so they wont be forgot.
 *  Typed callbacks, so it's convenient.
 *  Safe callbacks, so they can throw without concern.
 *  Callbacks in promise style.
 *  Stringent state management. I.e. hard fail, if methods called in wrong state.
 *  Kill functionality. Useful for also closing resource, when errors happen.
 */
export class NodeWS<MS extends SocketData, MR extends SocketData>
  implements NodeWSProv<MS>
{
  public ws: WebSocket;

  public waiter: Waiter<States, Events>;

  /**
   *
   */
  constructor(private deps: NodeWsDeps<MR>) {
    let startState: States;

    if ("ws" in deps) {
      startState = deps.startState;
      this.ws = deps.ws;
    } else {
      startState = "opening";
      this.ws = new WebSocket(
        "ws://" + deps.host + ":" + deps.port + "/" + deps.path
      );
    }

    //waiter

    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState,
      stoppingState: "stopping",
      endState: "stopped",
    });

    //
    // internal handlers
    //

    this.ws.on("open", this.onOpen);
    this.ws.on("message", this.onMessage);
    this.ws.on("close", this.onClose);

    //
    // external handlers
    //

    this.ws.on("error", deps.onError);

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  public send = (data: MS) => {
    if (!this.waiter.is("running")) {
      throw new Error(
        "Can't send. Socket not open." +
          " (state:" +
          this.waiter.getState() +
          ")"
      );
    }

    this.rawSend(data);
  };

  /**
   * doesn't check for running state.
   */
  private rawSend = (data: MS) => {
    if (typeof data !== "object") {
      throw new Error("non objects not supported.");
    }

    this.ws.send(JSON.stringify(data), (error) => {
      if (error) {
        this.deps.onError(error);
      }
    });
  };

  /**
   *
   */
  private onOpen = () => {
    this.waiter.set("running");

    this.deps.onOpen();
  };

  /**
   *
   */
  private onMessage = (rawMsg: string | Buffer) => {
    if (!this.waiter.is("running")) {
      this.deps.onError(
        new Error(
          "Received message while not open." +
            " (state:" +
            this.waiter.getState() +
            ")"
        )
      );
    }

    //parse

    let msg: MR;

    try {
      if (typeof rawMsg !== "string" && !(rawMsg instanceof Buffer)) {
        err("Unknown message type.", rawMsg);
      }

      msg = JSON.parse(rawMsg.toString());
    } catch (e) {
      this.deps.onError(e);
      return;
    }

    //waiter

    this.waiter.event("data", msg);

    //call external

    //Try-catch is needed to catch here, because `ws` will make the socket unresponsive, if an exception occurs.

    try {
      this.deps.onMessage(msg);
    } catch (e) {
      this.deps.onError(e);
    }
  };

  /**
   *
   */
  private onClose = () => {
    this.waiter.set("stopped");

    this.deps.onClose();
  };

  /**
   *
   */
  public shutdown = () => this.waiter.shutdown(() => this.ws.close());

  public noisyKill = () =>
    this.waiter.noisyKill(() => this.ws.terminate(), "NodeWs");
}
