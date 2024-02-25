import { EventController, Jsonable, assert } from "^jab";
import { then } from "^yapu";
import { FinallyFunc } from "^finally-provider";

export type WebSocketMockDeps = {
  onError: (error: unknown) => void;
  finally: FinallyFunc;
};

export type WebSocketMockBehavior = {
  beforeOpenEmitted?: () => Promise<void> | void;
  onOpenEmitted?: (removeWs: RemoteWebSocketMock) => void;
  onSend?: (data: string) => void;
  onClose?: (removeWs: RemoteWebSocketMock) => Promise<void> | void;
};

type RemoteWebSocketMock = {
  sendBack: (data: Jsonable) => void;
  closeRemote: () => void;
};

/**
 *
 */
export class WebSocketMock {
  private state: "open" | "closed" = "open";

  private _controllers = {
    open: new EventController(),
    error: new EventController(),
    message: new EventController(),
    close: new EventController(),
  };

  private remoteWs: RemoteWebSocketMock = {
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

    then(() => this.behavior?.beforeOpenEmitted?.())
      .then(() => this._controllers.open.fireEvent(undefined))
      .then(() => this.behavior?.onOpenEmitted?.(this.remoteWs))
      .catch(deps.onError);
  }

  /**
   *
   */
  public send = (data: any) => then(() => this.behavior?.onSend?.(data));

  /**
   *
   */
  public close = () => {
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
