import { assertNever } from "^jab";
import { makeSend, nodeRequire, registerOnMessage } from "^jab-node";

import { errorToTestLog, RogueData } from "^jatec";

import { JarunTestRunner } from "./JarunTestRunner";
import type {
  JarunProcessControllerMessage,
  JarunProcessMessage,
} from "./util";

/**
 *
 * - Can run in both process and worker.
 * - Registers promise and exception handlers.
 */
export class JarunProcessMainImpl {
  private jtr: JarunTestRunner;

  private send: (msg: JarunProcessMessage) => void;

  /**
   *
   */
  constructor() {
    this.jtr = new JarunTestRunner({
      timeoutms: 10000,
      onRogueTest: this.onRogueTest,
    });

    registerOnMessage(this.onMessage);

    this.send = makeSend();

    this.registerHandlers();
  }

  /**
   *
   */
  private runTest = (id: string, absTestFile: string) => {
    this.wrapRunTest(id, absTestFile)
      .then((data) => this.send({ type: "testDone", value: data }))
      .catch((error: unknown) => {
        this.send({
          type: "testDone",
          value: {
            cur: errorToTestLog(error),
          },
        });
      });
  };

  /**
   *
   */
  private wrapRunTest = (id: string, absTestFile: string) =>
    Promise.resolve().then(() =>
      this.jtr.runTest(id, () => nodeRequire(absTestFile).default)
    );

  /**
   *
   */
  private onRogueTest = (rogue: RogueData) => {
    this.send({ type: "rogue", value: rogue });
  };

  /**
   *
   */
  private onMessage = (msg: JarunProcessControllerMessage) => {
    switch (msg.type) {
      case "run":
        this.runTest(msg.id, msg.file);
        break;

      case "shutdown":
        process.exit();
        break;

      default:
        assertNever(msg);
    }
  };

  /**
   *
   */
  private registerHandlers = () => {
    //quick fix: allow existing handlers.

    if (process.listenerCount("uncaughtException") !== 0) {
      process.removeAllListeners("uncaughtException");
    }

    if (process.listenerCount("unhandledRejection") !== 0) {
      process.removeAllListeners("unhandledRejection");
    }

    //there can be only one

    if (process.listenerCount("uncaughtException") !== 0) {
      throw new Error("uncaughtException handler already registered");
    }

    if (process.listenerCount("unhandledRejection") !== 0) {
      throw new Error("unhandledRejection handler already registered");
    }

    //we are the one

    process.on("uncaughtException", this.onUncaughtException);
    process.on("unhandledRejection", this.onUnhandledPromiseRejection);
  };

  /**
   * - maybe promise is of interest.
   */
  private onUnhandledPromiseRejection: NodeJS.UnhandledRejectionListener = (
    error
  ) => {
    this.jtr.handleUhException(error, "uh-promise");
  };

  /**
   *
   */
  private onUncaughtException = (error: Error) => {
    this.jtr.handleUhException(error, "uh-exception");
  };
}
