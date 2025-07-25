import fs from "node:fs";
import path from "node:path";
import { MainFileDeclaration, assertNever, def } from "^jab";
import { FinallyFunc } from "^finally-provider";
import { Waiter } from "^state-waiter";
import { makeStdioIpcProcess } from "^process-util";
import {
  Bee,
  BeeDef,
  BeeListeners,
  BeeShutdownMessage,
  BeeStates,
} from "^bee-common";
import { ControllerMessage, RemoteBooterMessage } from "./internal";

type Deps<MR extends {}> = {
  def: BeeDef;
  finally: FinallyFunc;
  makeBareNodeProcess: MakeBareNodeProcess;

  //for testing
  booterCode2?: string;
} & BeeListeners<MR>;

export type MakeBareNodeProcess = (deps: BareNodeProcessListeners) => {
  write: (str: string) => void; //instead of send.
  kill: () => Promise<void>;
};

export type BareNodeProcessListeners = {
  javascriptCode: string;
  finally: FinallyFunc;
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
  onError: (error: unknown) => void;
  onExit: () => void;
};

export type BareProcess = {
  write: (str: string) => void; //instead of send.
  kill: () => Promise<void>;
};

export const remoteNodeBooterMainDeclaration2: MainFileDeclaration = {
  type: "node-bee",
  file: "RemoteNodeProcessBooter2",
  folder: __dirname,
};

/**
 * Makes a bare-bones bee from a bare node process.
 *
 *
 * does not deliver
 *  - possibility to require or import (it's only possible to use runBee)
 *  - source map support
 *  - lazy-require or cached-resolve
 *
 */
export class RemoteNodeProcess<MR extends {}, MS extends {}>
  implements Bee<MS>
{
  public waiter: Waiter<BeeStates, never>;

  public proc: BareProcess & {
    send: (msg: ControllerMessage) => void;
    stdioProtocolId: number;
    beeChannelToken: string;
  };

  private bufferedMessages: Array<any> | undefined = [];

  /**
   *
   */
  constructor(public deps: Deps<MR>) {
    //must be first, because listeners depend on it.

    this.waiter = new Waiter<BeeStates, never>({
      onError: deps.onError,
      startState: "running",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //make the process

    this.proc = makeStdioIpcProcess<BareProcess, MR, ControllerMessage>({
      ...deps,
      onMessage: this.onMessage as any,
      makeProcess: (innerDeps) =>
        this.deps.makeBareNodeProcess({
          ...deps,
          ...innerDeps,
          onError: this.onError,
          onExit: this.onExit,
          javascriptCode: this.getDefaultBooterCode1(),
        }),
    });

    //data for booter1

    const booter2Code = deps.booterCode2 ?? this.getDefaultBooterCode2();

    this.proc.write(
      `global.stdioProtocolId = ${this.proc.stdioProtocolId};` +
        booter2Code +
        "\x00"
    );

    //ensure clean shutdown

    this.deps.finally(() => this.noisyKill());
  }

  /**
   *
   */
  private onMessage = (msg: RemoteBooterMessage) => {
    //check state

    const state = this.waiter.getState();

    switch (state) {
      case "running":
      case "stopping":
        //continue
        break;

      case "stopped":
        throw new Error("Impossible");

      default:
        assertNever(state);
    }

    //handle message

    switch (msg.type) {
      case "ready": {
        // We need this ready-message from booter2 to ensure
        //  the following message doesn't end up in booter1.

        const beeCode = fs.readFileSync(this.deps.def.filename).toString();

        //send first message to booter2.

        this.proc.send({
          type: "startBee",
          def: this.deps.def,
          beeCode,
          beeChannelToken: this.proc.beeChannelToken,
        });

        break;
      }

      case "script-required": {
        //send buffered messages

        for (const msg of def(this.bufferedMessages)) {
          this.proc.send(msg);
        }

        this.bufferedMessages = undefined; //disable buffering

        break;
      }

      default:
        this.deps.onMessage(msg);
    }
  };

  /**
   * This code has a length restriction on ~30k.
   */
  private getDefaultBooterCode1 = () =>
    fs
      .readFileSync(path.join(__dirname, "./RemoteNodeProcessBooter1.js"))
      .toString();

  /**
   * This can be any length.
   */
  private getDefaultBooterCode2 = () =>
    fs
      .readFileSync(path.join(__dirname, "./RemoteNodeProcessBooter2.js"))
      .toString();

  /**
   *
   */
  private onError = (error: unknown) => {
    this.waiter.onError(error);
  };

  /**
   *
   */
  private onExit = () => {
    this.waiter.set("stopped");

    this.deps.onExit();
  };

  /**
   *  - we buffer messages because booter1 must have unregistered its stdin listener and
   *      booter2 must have registered its listener, before we safely can send messages.
   *
   */
  public send = (msg: BeeShutdownMessage | MS) => {
    if (this.bufferedMessages !== undefined) {
      this.bufferedMessages.push(msg);
    } else {
      this.proc.send(msg as any);
    }
  };

  public shutdown = () =>
    this.waiter.shutdown(() => this.send({ type: "shutdown" }));

  /**
   * cp.kill can't run away from its class.
   */
  public noisyKill = () =>
    this.waiter.noisyKill(() => this.proc.kill(), "RemoteNodeProcess");

  public is = (_state: BeeStates) => {
    throw new Error("not impl");
  };

  /**
   *
   */
  public kill = () => this.waiter.kill(() => this.proc.kill());
}
