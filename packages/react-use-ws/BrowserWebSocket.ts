import { assert, getPromise, PromiseTriple, WsStates } from "./internal";

export type InternalStates =
  | "initial"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "reconnecting-waiting"
  | "reconnecting-closed"
  | "connecting-closing"
  | "closing"
  | "closed";

export type Deps<MR> = {
  URL: string;
  reconnect: boolean;
  onServerMessage: (data: MR) => void;
  onStateChange?: (state: WsStates) => void;
  onError: (error: Event) => void;

  //for testing
  makeWebSocket?: () => WebSocket;
};

const MAX_RETRIES = 5;
const RECONNECT_INTERVAL = 500;

/**
 *
 * - messages are all JSON stringified
 * - onError is a little strange. Because WS errors are a little strange.
 *
 */
export class BrowserWebSocket<MS, MR> {
  private ws?: WebSocket;

  //in states: connecting, reconnecting - the connection is technically also closed.
  public state: InternalStates = "initial";

  private reconnectCount = 0;

  private reconnectTimeoutHandle?: any;

  private closeProm?: PromiseTriple<void>;

  private unsubscribe = false;

  /**
   *
   */
  constructor(private deps: Deps<MR>) {}

  /**
   *
   */
  private setState = (state: InternalStates) => {
    this.state = state;

    if (this.deps.onStateChange && !this.unsubscribe) {
      switch (this.state) {
        case "initial":
        case "closed":
        case "closing":
        case "connecting-closing":
          this.deps.onStateChange("closed");
          break;

        case "connecting":
          this.deps.onStateChange("connecting");
          break;

        case "reconnecting":
        case "reconnecting-waiting":
        case "reconnecting-closed":
          this.deps.onStateChange("reconnecting");
          break;

        case "connected":
          this.deps.onStateChange("connected");
          break;

        default:
          const _: never = this.state;

          throw new Error("Missing action for state: " + this.state);
      }
    }
  };

  /**
   *
   */
  public openWebSocket = () => {
    if (this.state !== "initial") {
      throw new Error("Can't open, state: " + this.state);
    }

    this.setState("connecting");

    return this.rawOpenWebSocket();
  };

  /**
   * The promise has limited usefulness.
   */
  private rawOpenWebSocket = () =>
    new Promise<void>((resolve, reject) => {
      assert(this.state === "connecting" || this.state == "reconnecting");

      if (this.deps.makeWebSocket) {
        this.ws = this.deps.makeWebSocket();
      } else {
        this.ws = new WebSocket(this.deps.URL);
      }

      let hasSettled = false; //state for the promise

      this.ws.addEventListener("open", () => {
        switch (this.state) {
          case "initial":
          case "reconnecting-waiting":
          case "reconnecting-closed":
          case "closed":
          case "closing":
          case "connected":
            throw new Error("impossible state: " + this.state);

          case "connecting-closing": {
            assert(this.closeProm !== undefined);

            this.ws?.close(4000);
            this.setState("closing");
            return;
          }

          case "reconnecting":
          case "connecting": {
            this.reconnectCount = 0;

            if (!hasSettled) {
              hasSettled = true;
              resolve();
            }

            this.setState("connected");
            break;
          }

          default:
            const _: never = this.state;

            throw new Error("Missing action for state: " + this.state);
        }
      });

      this.ws.addEventListener("error", (errEvent) => {
        if (!hasSettled) {
          hasSettled = true;
          reject(errEvent);
        } else {
          this.deps.onError(errEvent);
        }
      });

      this.ws.addEventListener("close", this.onClose);

      this.ws.addEventListener("message", this.onMessage);
    });

  /**
   *
   */
  public apiSend = (data: MS) => {
    if (this.state === "connected") {
      this.ws?.send(JSON.stringify(data));
    } else {
      console.log("Can't send: " + this.state);
    }
  };

  /**
   *
   */
  private onMessage = (msg: MessageEvent) => {
    switch (this.state) {
      case "initial":
      case "reconnecting-waiting":
      case "reconnecting-closed":
        throw new Error("impossible state: " + this.state);

      case "closed":
      case "closing":
      case "connecting-closing":
        //just ignore. Messages here can't be deterministic, anyway.
        break;

      case "connected":
      case "connecting":
      case "reconnecting": {
        if (typeof msg.data !== "string") {
          throw new Error("Unknown message type.", msg.data);
        }

        let data;

        try {
          data = JSON.parse(msg.data);
        } catch (e) {
          console.error("Error parsing server response: ", msg.data);
          throw e;
        }

        this.deps.onServerMessage(data);
        break;
      }

      default:
        const _: never = this.state;

        throw new Error("Missing action for state: " + this.state);
    }
  };

  /**
   *
   */
  public closeWebSocket = (unsubscribe = false) => {
    switch (this.state) {
      case "initial":
        throw new Error("Connection has not been opened yet.");

      case "reconnecting-closed":
      case "connecting-closing":
      case "closed":
      case "closing":
        throw new Error("Connection is already " + this.state);

      case "connecting":
      case "reconnecting": {
        this.setState("connecting-closing");

        return this.closeHelper(unsubscribe);
      }

      case "connected": {
        this.ws?.close();

        this.setState("closing");

        return this.closeHelper(unsubscribe);
      }

      case "reconnecting-waiting":
        clearTimeout(this.reconnectTimeoutHandle);
        this.reconnectTimeoutHandle = undefined;

        this.setState("closed");

        return Promise.resolve();

      default:
        const _: never = this.state;

        throw new Error("Missing action for state: " + this.state);
    }
  };

  /**
   *
   */
  private closeHelper = (unsubscribe: boolean) => {
    this.unsubscribe = unsubscribe;

    this.closeProm = getPromise();

    return this.closeProm.promise;
  };

  /**
   *
   */
  private onClose = () => {
    switch (this.state) {
      case "initial":
      case "reconnecting-waiting":
      case "connecting-closing":
      case "closed":
      case "reconnecting-closed":
        throw new Error("impossible state: " + this.state);

      case "closing":
        this.closeProm!.resolve();
        this.setState("closed");
        break;

      case "connected":
      case "connecting":
      case "reconnecting": {
        if (!this.deps.reconnect) {
          this.setState("closed");
          return;
        }

        // try to reconnect

        this.reconnectCount++;

        if (this.reconnectCount > MAX_RETRIES) {
          console.log("Too many retries");
          this.setState("reconnecting-closed");
          return;
        }

        this.reconnectTimeoutHandle = setTimeout(this.doReconnect, RECONNECT_INTERVAL); // prettier-ignore

        this.setState("reconnecting-waiting");
        break;
      }

      default:
        const _: never = this.state;

        throw new Error("Missing action for state: " + this.state);
    }
  };

  /**
   *
   */
  private doReconnect = () => {
    switch (this.state) {
      case "initial":
      case "connecting-closing":
      case "closed":
      case "closing":
      case "connected":
      case "connecting":
      case "reconnecting":
      case "reconnecting-closed":
        throw new Error("impossible state: " + this.state);

      case "reconnecting-waiting": {
        this.reconnectTimeoutHandle = undefined;

        this.setState("reconnecting");

        this.rawOpenWebSocket().catch((error: any) => {
          //an attempt to rethrow, when it's not a connection error.
          if (error?.target?.url !== this.deps.URL) {
            throw error;
          }
        });

        return;
      }

      default:
        const _: never = this.state;

        throw new Error("Missing action for state: " + this.state);
    }
  };
}
