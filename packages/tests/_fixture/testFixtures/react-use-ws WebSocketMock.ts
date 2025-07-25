import { EventController, Jsonable, assert } from "^jab";
import { then } from "^yapu";
import { FinallyFunc } from "^finally-provider";

export type WebSocketMockDeps = {
  onError: (error: unknown) => void;
  finally: FinallyFunc;
};

export type WebSocketMockBehavior = {
  beforeOpenEmitted?: (removeWs: RemoteWebSocketMock) => Promise<void> | void;
  onOpenEmitted?: (removeWs: RemoteWebSocketMock) => void;
  onOpen?: (removeWs: RemoteWebSocketMock) => void;
  onSend?: (data: string) => void;
  onClose?: (removeWs: RemoteWebSocketMock) => Promise<void> | void;
};

type RemoteWebSocketMock = {
  rejectOpen: (err: Error) => void;
  sendBack: (data: Jsonable) => void;
  closeRemote: () => void;
};

/**
 *
 */
export class WebSocketMock {
  public state: "open" | "closed" = "open";

  private _controllers = {
    open: new EventController(),
    error: new EventController<Error>(),
    message: new EventController(),
    close: new EventController(),
  };

  private remoteWs: RemoteWebSocketMock = {
    /**
     *
     */
    rejectOpen: (err: Error) => {
      assert(this.state === "open", "WebSocketMock can only be closed in open state, was: " + this.state); // prettier-ignore

      this._controllers.error.fireEvent(err);

      this.remoteWs.closeRemote();
    },

    /**
     * Send message back from the remote websocket.
     */
    sendBack: (data: Jsonable) => {
      this._controllers.message.fireEvent({ data: JSON.stringify(data) });
    },

    /**
     * Close the websocket from the remote end.
     */
    closeRemote: () => {
      assert(this.state === "open", "WebSocketMock can only be closed in open state, was: " + this.state); // prettier-ignore
      this.state = "closed";

      this._controllers.close.fireEvent(undefined);
    },
  };

  /**
   *
   */
  constructor(
    private deps: WebSocketMockDeps,
    private behavior?: WebSocketMockBehavior
  ) {
    //async, because caller will not be ready here.

    if (this.behavior?.onOpen) {
      //the delay is needed, because the socket may add listeners sync after new WebSocket
      then(() => this.behavior?.onOpen?.(this.remoteWs));
    } else {
      then(() => this.behavior?.beforeOpenEmitted?.(this.remoteWs))
        .then(() => this._controllers.open.fireEvent(undefined))
        .then(() => this.behavior?.onOpenEmitted?.(this.remoteWs))
        .catch(deps.onError);
    }

    //ensure clean shutdown

    this.deps.finally(() => {
      assert(this.state === "closed", "WebSocketMock was not properly closed.");
    });
  }

  /**
   *
   */
  public send = (data: any) => {
    assert(this.state === "open", "WebSocketMock can only send in open state, was: " + this.state); // prettier-ignore

    return then(() => this.behavior?.onSend?.(data));
  };

  /**
   *
   */
  public close = () => {
    assert(this.state === "open", "WebSocketMock can only be closed in open state, was: " + this.state); // prettier-ignore
    this.state = "closed";

    then(() => this.behavior?.onClose?.(this.remoteWs)).then(() =>
      this._controllers.close.fireEvent(undefined)
    );
  };

  /**
   *
   */
  public addEventListener = (
    type: "open" | "error" | "message" | "close",
    listener: () => void
  ) => {
    this._controllers[type].addListener(listener);
  };

  /**
   *
   */
  public removeEventListener = (
    type: "open" | "error" | "message" | "close",
    listener: () => void
  ) => {
    this._controllers[type].removeListener(listener);
  };
}
