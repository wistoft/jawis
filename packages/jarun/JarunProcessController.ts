import { prej, FinallyFunc, Waiter } from "^jab";

import { ProcessRestarterDeps, ProcessRestarterProv } from "^jab-node";

import { JarunTestRunner } from "^jatec";

import { JarunProcessControllerMessage } from ".";

import {
  JarunProcessControllerInner,
  JarunProcessControllerInnerDeps,
} from "./JarunProcessControllerInner";

export type MakeJarunProcessRestarter = <MR extends {}, MS extends {}>(
  deps: Omit<ProcessRestarterDeps<MR>, "def" | "makeBee"> & {
    jarunBooterName: string;
    jarunBooterDir: string;
  }
) => ProcessRestarterProv<MS>;

export type JarunProcessControllerDeps = {
  makeProcessRestarter: MakeJarunProcessRestarter;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
} & Omit<JarunProcessControllerInnerDeps, "prSend">;

type States = "ready" | "stopping" | "done";
type Events = never;

/**
 * Integrate ProcessRestarter and JarunProcessControllerInner
 *
 * - Jarun process is always started with TypeScript compiler.
 *
 * todo
 *  - This should just be a factory of some sort.
 *    - there's no need for state here.
 *    - Inner should be responsible for kill.
 */
export class JarunProcessController implements JarunTestRunner {
  private waiter: Waiter<States, Events>;

  private pr: ProcessRestarterProv<JarunProcessControllerMessage>;

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

    this.pr = this.deps.makeProcessRestarter({
      ...this.deps,
      jarunBooterName: "JarunProcessMain",
      jarunBooterDir: __dirname,
      filterRequireMessages: false,
      onMessage: this.inner.onMessage,
      onLog: this.inner.onLog,
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
//
