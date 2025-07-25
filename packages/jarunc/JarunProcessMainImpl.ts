import { BeeProv } from "^bee-common";
import { errorToTestLog, RogueData } from "^jatec";
import { assertNever, MainFileDeclaration } from "^jab";

import {
  JarunProcessControllerMessage,
  JarunProcessMessage,
  JarunTestRunner,
} from "./internal";

export const jarunProcessMainDeclaration: MainFileDeclaration = {
  type: "pure-bee",
  file: "JarunProcessMain",
  folder: __dirname,
};

/**
 *
 * - Can run in both process and worker.
 * - Registers promise and exception handlers.
 */
export class JarunProcessMainImpl {
  private jtr: JarunTestRunner;

  /**
   *
   */
  constructor(private deps: BeeProv<JarunProcessMessage>) {
    this.jtr = new JarunTestRunner({
      timeoutms: 10000,
      finallyFuncTimeout: 5000,
      addUhExceptionsToCurrentTest: true,
      onRogueTest: this.onRogueTest,
    });

    this.deps.registerOnMessage(this.onMessage);

    this.deps.registerErrorHandlers(this.jtr.handleUhException);
  }

  /**
   *
   */
  private runTest = (id: string, absTestFile: string) => {
    Promise.resolve()
      .then(() =>
        this.jtr.runTest(id, () => this.deps.importModule(absTestFile))
      )
      .then((data) => this.deps.beeSend({ type: "testDone", value: data }))
      .catch((error: unknown) => {
        this.deps.beeSend({
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
  private onRogueTest = (rogue: RogueData) => {
    this.deps.beeSend({ type: "rogue", value: rogue });
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
        this.deps.beeExit();
        break;

      default:
        assertNever(msg);
    }
  };
}
