import { assertNever } from "^jab";
import {
  makeSend,
  nodeRequire,
  registerErrorHandlers,
  registerOnMessage,
} from "^jab-node";

import { errorToTestLog, RogueData } from "^jatec";

import {
  JarunTestRunner,
  JarunProcessControllerMessage,
  JarunProcessMessage,
} from "./internal";

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

    registerErrorHandlers(this.jtr.handleUhException);
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
      this.jtr.runTest(id, () => nodeRequire(absTestFile))
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
}
