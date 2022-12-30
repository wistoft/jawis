import { def, err } from "^jab";
import { WsStates } from "./internal";

export type Deps<MR> = {
  URL: string;
  reconnect: boolean;
  onServerMesssage: (data: MR) => void;
  onStateChange?: (state: WsStates) => void;
  onError: (error: Event) => void;
};

const MAX_RETRIES = 5;
const RECONNECT_INTERVAL = 500;

/**
 *
 * - superfluously implemented
 * - messages are all JSON stringified
 * - onError in a little strange. Because WS errors are a little strange.
 */
export class BrowserWebSocket<MS, MR> {
  private ws?: WebSocket;

  //in states: connecting, reconnecting - the connection is technically also closed.
  public state: WsStates;

  private reconnectCount = 0;

  // the desired state
  private shouldBeConnected = false;

  /**
   *
   */
  constructor(private deps: Deps<MR>) {
    this.state = "closed";
  }

  /**
   *
   */
  private setState = (state: WsStates) => {
    this.state = state;

    if (this.deps.onStateChange) {
      this.deps.onStateChange(state);
    }
  };

  /**
   *
   */
  public openWebSocket = () => {
    if (this.state !== "closed") {
      err("Can't open, state: " + this.state);
    }

    return this.rawOpenWebSocket();
  };

  /**
   * The promise has limited usefulness.
   */
  private rawOpenWebSocket = () =>
    new Promise<void>((resolve, reject) => {
      this.shouldBeConnected = true;
      this.ws = new WebSocket(this.deps.URL);

      let hasSettled = false; //state for the promise

      this.ws.addEventListener("open", () => {
        this.setState("connected");

        this.reconnectCount = 0;

        if (!hasSettled) {
          hasSettled = true;
          resolve();
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
  public reconnectWebSocket = () => {
    this.reconnectCount++;
    if (this.reconnectCount > MAX_RETRIES) {
      console.log("Too many retries");
      return;
    }

    setTimeout(() => {
      this.rawOpenWebSocket().catch((error: any) => {
        //an attempt to rethrow, when it's not a connection error.
        if (error?.target?.url !== this.deps.URL) {
          throw error;
        }
      });
    }, RECONNECT_INTERVAL);
  };

  /**
   *
   */
  public closeWebSocket = () => {
    if (this.state === "closed") {
      err("Connection is already closed");
    }

    this.shouldBeConnected = false;

    if (this.state === "connected") {
      def(this.ws).close(4000);
    }
  };

  public apiSend = (data: MS) => {
    if (this.state === "connected") {
      def(this.ws).send(JSON.stringify(data));
    } else {
      console.log("Socket is closed.");
    }
  };

  /**
   *
   */
  private onMessage = (msg: MessageEvent) => {
    if (typeof msg.data !== "string") {
      throw err("Unknown message type.", msg.data);
    }

    let data;

    try {
      data = JSON.parse(msg.data);
    } catch (e) {
      err("Error parsing server response: ", [msg.data, e]);
    }

    this.deps.onServerMesssage(data);
  };

  /**
   *
   */
  private onClose = () => {
    if (this.deps.reconnect && this.shouldBeConnected) {
      this.setState("reconnecting");

      this.reconnectWebSocket();
    } else {
      this.setState("closed");
    }
  };
}
