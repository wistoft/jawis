import {
  AbsoluteFile,
  LogEntry,
  assertNever,
  err,
  unknownToErrorData,
} from "^jab";

import { FinallyFunc } from "^finally-provider";
import {
  Bee,
  BeeFrostClientMessage,
  BeeFrostServerMessage,
  MakeBee,
} from "./internal";

export type BeeHiveDeps = {
  send: (data: BeeFrostClientMessage) => void;
  makeBee: MakeBee;
  finally: FinallyFunc;
};

/**
 *
 *
 */
export class BeeHive {
  private bees: Map<number, Bee<any>> = new Map();

  constructor(private deps: BeeHiveDeps) {}

  /**
   *
   */
  public onServerMessage = (msg: BeeFrostServerMessage) => {
    switch (msg.type) {
      case "setConf": {
        throw new Error("to remove");
        break;
      }

      case "makeBee": {
        this.make(msg.bid, msg.filename);
        break;
      }

      case "message": {
        const worker = this.bees.get(msg.bid);

        if (worker === undefined) {
          throw err("BeeHive.onMessage: Unknown bee: ", msg.bid);
        }

        worker.send(msg.data);
        break;
      }

      case "shutdown": {
        const worker = this.bees.get(msg.bid);

        if (worker === undefined) {
          throw err("BeeHive.Shutdown: Unknown bee: ", msg.bid);
        }

        worker.send({ type: "shutdown" });
        break;
      }

      case "kill": {
        const worker = this.bees.get(msg.bid);

        if (worker === undefined) {
          throw err("BeeHive.Shutdown: Unknown bee: ", msg.bid);
        }

        this.bees.delete(msg.bid);

        worker.kill();
        break;
      }

      default:
        assertNever(msg, "Unknown message");
    }
  };

  /**
   *
   */
  public onError = (error: unknown) => {
    this.deps.send({
      type: "error",
      data: unknownToErrorData(error),
    });
  };

  /**
   *
   */
  public shutdown = () => {
    throw new Error("not impl");
  };

  /**
   *
   */
  private make = (bid: number, filename: AbsoluteFile) => {
    const onLog = (data: LogEntry) =>
      this.deps.send({
        type: "log",
        bid,
        data,
      });

    const bee = this.deps.makeBee({
      def: { filename },
      finally: this.deps.finally,
      onMessage: (data: any) => {
        this.deps.send({
          type: "message",
          bid,
          data,
        });
      },
      onLog,
      onStdout: (data: string | Buffer) =>
        onLog({
          type: "stream",
          logName: "stdout",
          data,
        }),
      onStderr: (data: string | Buffer) =>
        onLog({
          type: "stream",
          logName: "stderr",
          data,
        }),
      onError: (error: unknown) =>
        onLog({
          type: "error",
          data: unknownToErrorData(error),
        }),
      onExit: () =>
        this.deps.send({
          type: "exit",
          bid,
          data: 0,
        }),
    });

    this.bees.set(bid, bee);
  };
}
