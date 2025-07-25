import { ProcessRestarterDeps, ProcessRestarterProv } from "^process-util";
import { Waiter } from "^state-waiter";
import { FinallyFunc } from "^finally-provider";

import { SendLog, GetAbsoluteSourceFile } from "^jab";
import { getAbsoluteSourceFile_live } from "^jab-node";
import { jarunProcessMainDeclaration } from "^jarunc";
import {
  JarunProcessControllerInner,
  JarunProcessControllerMessage,
  JarunTestRunnerProv,
  JarunProcessControllerInnerDeps,
  JarunProcessMessage,
} from "./internal";

//makes it possible to be agnostic towards the compiler, makeBee.
export type MakeJarunProcessRestarter = (
  deps: Omit<ProcessRestarterDeps<JarunProcessMessage>, "makeBee">
) => ProcessRestarterProv<JarunProcessControllerMessage>;

export type JarunProcessControllerDeps = {
  makeProcessRestarter: MakeJarunProcessRestarter;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;
  onLog: SendLog;
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
export class JarunProcessController implements JarunTestRunnerProv {
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

    //booter

    const getAbsoluteSourceFile = deps.getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

    const filename = getAbsoluteSourceFile(jarunProcessMainDeclaration);

    //pr

    this.pr = this.deps.makeProcessRestarter({
      ...this.deps,
      def: { filename },
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
  public runTest = (id: string, absTestFile: string) =>
    this.inner.runTest(id, absTestFile);

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
