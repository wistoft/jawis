import async_hooks from "async_hooks";
import {
  assertNever,
  beeExit,
  makeSend,
  registerOnMessage,
  registerOnUncaughtException,
  registerOnUnhandleRejection,
  enable,
} from "^jab";

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

    registerOnMessage(this.onMessage, this.onError);

    this.send = makeSend();

    this.registerHandlers();

    enable(async_hooks);
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
      this.jtr.runTest(id, () => eval("require")(absTestFile))
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
        beeExit();
        break;

      default:
        assertNever(msg);
    }
  };

  /**
   *
   */
  private onError = (error: unknown) => {
    this.jtr.handleUhException(error, "uh-exception");
  };

  /**
   *
   */
  private registerHandlers = () => {
    //there can be only one

    if ((global.process as any)?.listenerCount) {
      //we can only do this in nodejs.

      if (process.listenerCount("uncaughtException") !== 0) {
        throw new Error("uncaughtException handler already registered");
      }

      if (process.listenerCount("unhandledRejection") !== 0) {
        throw new Error("unhandledRejection handler already registered");
      }
    }

    //we are the one

    registerOnUncaughtException((event) => {
      event.preventDefault();
      this.jtr.handleUhException(event.error, "uh-exception");
    });

    registerOnUnhandleRejection((event) => {
      event.preventDefault();
      this.jtr.handleUhException(event.reason, "uh-promise");
    });
  };
}
