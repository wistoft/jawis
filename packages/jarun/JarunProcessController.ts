import { FinallyFunc } from "^finally-provider";
import { prej } from "^jab";

import { getFileToRequire, MakeBee, ProcessRestarter } from "^jab-node";

import { TestRunner } from "^jates";
import { Waiter } from "^state-waiter";

import { JarunProcessControllerMessage, JarunProcessMessage } from ".";

import {
  JarunProcessControllerInner,
  JarunProcessControllerInnerDeps,
} from "./JarunProcessControllerInner";

export type JarunProcessControllerDeps = {
  customBooter?: string;
  makeTsBee: MakeBee;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
} & Omit<JarunProcessControllerInnerDeps, "prSend">;

type States = "ready" | "stopping" | "done";
type Events = never;

/**
 * Integrate ProcessRestarter and JarunProcessControllerInner
 *
 * - Jarun process is always started with TypeScript compiler.
 */
export class JarunProcessController implements TestRunner {
  private waiter: Waiter<States, Events>;

  private pr: ProcessRestarter<
    JarunProcessMessage,
    JarunProcessControllerMessage
  >;

  private inner: JarunProcessControllerInner;

  /**
   *
   */
  constructor(private deps: JarunProcessControllerDeps) {
    this.deps.finally(() => this.noisyKill()); //must be before the process restarter, because we want to shutdown, before it.

    //must be before listeners, because they depend on it.
    this.waiter = new Waiter<States, Events>({
      onError: this.deps.onError,
      startState: "ready",
      stoppingState: "stopping",
      endState: "done",
    });

    //inner

    this.inner = new JarunProcessControllerInner({
      ...deps,
      prSend: this.prSend,
    });

    //pr

    const filename =
      this.deps.customBooter || getFileToRequire(__dirname, "JarunProcessMain");

    this.pr = new ProcessRestarter<
      JarunProcessMessage,
      JarunProcessControllerMessage
    >({
      ...this.deps,
      filename,
      filterRequireMessages: false,
      makeBee: deps.makeTsBee,
      onMessage: this.inner.onMessage,
      onRestarted: this.inner.onRestarted,
      onUnexpectedExit: this.inner.onUnexpectedExit,
      onStdout: this.inner.onStdout,
      onStderr: this.inner.onStderr,
      onError: deps.onError,
    });
  }

  /**
   *
   */
  public runTest = (id: string, absTestFile: string) => {
    if (!this.waiter.is("ready")) {
      return prej("Can't run test. (state:" + this.waiter.getState() + ")");
    }

    return this.inner.runTest(id, absTestFile);
  };

  /**
   * used by the inner controller.
   */
  public prSend = (msg: JarunProcessControllerMessage) => this.pr.send(msg);

  /**
   *
   */
  public kill = () => this.waiter.kill(this.pr.kill, true);

  /**
   *
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.pr.kill(), "JarunProcessController", true);
}
