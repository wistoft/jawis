import { WsPoolProv } from "^jab-express";

import { LogEntry, capture, tryProp } from "^jab";
import {
  ServerMessage,
  ScriptStatus,
  ClientMessage,
  ScriptPoolControllerDeps,
} from "./internal";

export type ClientComProv = Pick<
  ScriptPoolControllerDeps,
  "onScriptMessage" | "onScriptLog"
> & {
  sendProcessStatus: (status: ScriptStatus[]) => void;
};

export type ClientComControllerDeps = {
  wsPool: WsPoolProv<ServerMessage, ClientMessage>;
};

/**
 *
 */
export class ClientComController implements ClientComProv {
  timeoutHandle?: NodeJS.Timeout;
  buffered = {
    stdout: new Map<string, (string | Buffer)[]>(),
    stderr: new Map<string, (string | Buffer)[]>(),
  };

  constructor(private deps: ClientComControllerDeps) {}

  /**
   *
   */
  public sendProcessStatus = (status: ScriptStatus[]) => {
    this.deps.wsPool.send({
      type: "processStatus",
      data: status,
    });
  };

  /**
   *
   */
  public onScriptMessage = (script: string, msg: any) => {
    if (tryProp(msg, "jago") === "channel-token-goes-here") {
      delete msg["jago"];
      this.deps.wsPool.send(msg);
    } else {
      this.onScriptLog(script, {
        type: "log",
        logName: "messages",
        data: [capture(msg)],
      });
    }
  };

  /**
   *
   */
  private emitBufferedData = () => {
    this.timeoutHandle = undefined;

    const keys: (keyof typeof this.buffered)[] = Object.keys(
      this.buffered
    ) as any;

    for (const logName of keys) {
      for (const [script, _data] of this.buffered[logName].entries()) {
        const data = _data.join("");
        this.deps.wsPool.send({
          script,
          type: "stream",
          data,
          logName,
        });
      }

      this.buffered[logName] = new Map();
    }
  };

  /**
   *
   * - Throttle the stdout/stderr because the websocket is probably slow,
   *    and we need to return fastest possible in onStdout/onStderr, so
   *    we don't slow down the emitter.
   * - Turn Buffer data in streams into string, because they can't be stringified.
   *    Because NodeWs makes JSON.stringify.
   */
  public onScriptLog = (script: string, output: LogEntry) => {
    if (output.type === "stream")
      if (output.logName === "stdout" || output.logName === "stderr") {
        if (!this.timeoutHandle) {
          this.timeoutHandle = setTimeout(this.emitBufferedData, 100);
        }

        let tmp = this.buffered[output.logName].get(script);

        if (!tmp) {
          tmp = [];
          this.buffered[output.logName].set(script, tmp);
        }

        tmp.push(output.data);
        return;
      }

    // other non-buffered data.

    this.deps.wsPool.send({
      script,
      ...output,
    });
  };
}
