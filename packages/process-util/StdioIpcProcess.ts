import { Bee, BeeListeners, BeeShutdownMessage, BeeStates } from "^bee-common";
import { FinallyFunc } from "^finally-provider";
import { StdProcess, makeIpcDeps } from "./internal";

export type StdioIpcProcessDeps<MR extends {}> = {
  filename: string;
  args?: string[];
  cwd?: string;
  env?: {
    [key: string]: string | undefined;
  };
  finally: FinallyFunc;
  onExit: (status?: number | null) => void;
} & Omit<BeeListeners<MR>, "onExit">;

/**
 * A funny mix between bee and process. Not quite a union of the two.
 *
 *  - can only be used for `StdioIpcProcess`. And abstraction is annoying,
 *      for classes. So maybe use a function instead.
 *
 *
 * Similar: makeStdioIpcProcess, StdioIpcProcess
 */
export class StdioIpcProcess<MR extends {}, MS = never> implements Bee<MS> {
  public proc: StdProcess;
  private _send!: (msg: any) => void;

  /**
   *
   */
  constructor(deps: StdioIpcProcessDeps<MR>) {
    this.proc = this.makeProcess(deps);
  }

  /**
   *
   */
  private makeProcess = (deps: StdioIpcProcessDeps<MR>) => {
    const {
      onStdout,
      onStderr,
      flush,
      send,
      stdioProtocolId,
      beeChannelToken,
    } = makeIpcDeps({
      ...deps,
      write: this.write,
    });

    this._send = send;

    // return

    return new StdProcess({
      ...deps,
      env: {
        ...deps.env,
        IPC_PROCESS_VARS: JSON.stringify({
          stdioProtocolId,
          beeChannelToken,
        }),
      },
      onStdout,
      onStderr,
      onExit: (status) => {
        flush();
        deps.onExit(status);
      },
    });
  };

  /**
   *
   */
  public send = (msg: BeeShutdownMessage | MS) => {
    this._send(msg);
  };

  /**
   *
   */
  private write = (str: string) => {
    this.proc.write(str);
  };

  public shutdown = () => this.proc.shutdown();

  public noisyKill = () => this.proc.noisyKill();

  public kill = () => this.proc.kill();

  public is = (state: BeeStates) => this.proc.is(state);
}
