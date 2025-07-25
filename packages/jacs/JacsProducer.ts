import path from "node:path";
import { Worker, WorkerOptions } from "node:worker_threads";

import {
  AbsoluteFile,
  err,
  GetAbsoluteSourceFile,
  getRandomInteger,
  unknownToErrorData,
} from "^jab";
import { getAbsoluteSourceFile_live } from "^jab-node";
import { JabWorker, MakeNodeWorker } from "^process-util";
import { FinallyFunc } from "^finally-provider";
import { safeCatch } from "^yapu";
import { BeeDef, BeeDeps, tryHandleTunneledLog } from "^bee-common";
import { makeSharedResolveMap, ResolveCacheMap } from "^cached-resolve";

import {
  getControlArray,
  setCompiling,
  signalConsumerSync,
  SourceFileLoader,
  ConsumerMessage,
  WorkerData,
  jacsConsumerMainDeclaration,
} from "./internal";

export type JacsProducerDeps = {
  sfl: Pick<SourceFileLoader, "load" | "getTsConfigPaths">;
  onError: (error: unknown) => void;
  finally: FinallyFunc;

  //config

  consumerTimeout: number;
  consumerSoftTimeout: number;
  maxSourceFileSize: number;
  cacheNodeResolve: boolean;
  tsConfigPath: boolean;
  doSourceMap: boolean;

  //for development

  customBooter?: string;
  getAbsoluteSourceFile?: GetAbsoluteSourceFile;
  notify?: typeof Atomics.notify;
};

/**
 *
 * - It's impossible to compile dev code to esm, because lazy load can't be done for esm.
 *
 */
export class JacsProducer {
  private resolveCache?: ResolveCacheMap;

  private channelToken;

  constructor(private deps: JacsProducerDeps) {
    if (deps.cacheNodeResolve) {
      this.resolveCache = makeSharedResolveMap();
    }

    this.channelToken = "" + getRandomInteger();
  }

  /**
   * - returned promise is just for tests.
   */
  public onCompile = (
    controlArray: Int32Array,
    dataArray: Uint8Array,
    file: string
  ) => {
    //protocol state

    setCompiling(controlArray);

    //compile

    return this.deps.sfl.load(file).then(
      (code) => {
        signalConsumerSync(
          "success",
          code,
          controlArray,
          dataArray,
          this.deps.notify
        );
      },
      safeCatch(this.deps.onError, (error) => {
        const errorData = unknownToErrorData(error);

        signalConsumerSync(
          "error",
          errorData.msg, //only error message for the consumer.
          controlArray,
          dataArray,
          this.deps.notify
        );
      })
    );
  };

  /**
   *
   */
  public makeJacsWorkerBee = <MS, MR>(beeDeps: BeeDeps<MR>) => {
    const { realFilename, shared } = this.getWorkerConf(beeDeps.def);

    //on message

    const onMessage = (msg: ConsumerMessage) => {
      if (tryHandleTunneledLog(msg, beeDeps.onLog, this.channelToken)) {
        return;
      }

      //todo: this fails if message is null. And user controls this.
      if (msg.compileRequest === this.channelToken) {
        this.onCompile(shared.controlArray, shared.dataArray, msg.file);
      } else {
        //the message belongs to the user.

        beeDeps.onMessage(msg as unknown as MR);
      }
    };

    //worker

    const execArgv: string[] = [];

    return new JabWorker<MS, ConsumerMessage, WorkerData>({
      filename: realFilename,
      workerData: shared,
      onMessage,
      onStdout: beeDeps.onStdout,
      onStderr: beeDeps.onStderr,
      onError: beeDeps.onError,
      onExit: beeDeps.onExit,
      finally: beeDeps.finally,
      workerOptions: {
        execArgv,
      },
      collectSubprocesses: true,
    });
  };

  /**
   * Make a worker thread, that compiles TypeScript automatically.
   *
   * - WorkerData is given to the script, if it exports a `main` function.
   *
   * impl
   *  - Filter out compile messages, so the users don't see them.
   */
  public makeTsWorker: MakeNodeWorker = (
    filename: AbsoluteFile,
    options: WorkerOptions = {}
  ) => {
    const { realFilename, shared } = this.getWorkerConf({
      filename,
      data: options.workerData,
    });

    const worker = new Worker(realFilename, {
      ...options,
      workerData: shared,
    });

    //on message

    const onMessage = (msg: ConsumerMessage) => {
      if (msg.compileRequest === this.channelToken) {
        this.onCompile(shared.controlArray, shared.dataArray, msg.file);
      }
    };

    worker.addListener("message", onMessage);

    //ensure listener isn't disturbed by jacs.

    this.monkeyPatchWorker(worker);

    return worker;
  };

  /**
   *
   * Monkey patch add message listener, so we can filter away jacs-compile messages.
   */
  private monkeyPatchWorker = (worker: Worker) => {
    (worker as any).__originalAddListener = worker.addListener;

    worker.addListener = (event: any, outerListener: any, ...args: any[]) => {
      let listener = outerListener;

      if (event === "message") {
        listener = (msg: any, ...args: any[]) => {
          //only send to outer, if it's not a jacs message.
          if (msg.compileRequest !== this.channelToken) {
            outerListener(msg, ...args);
          }
        };
      }

      return (worker as any).__originalAddListener(event, listener, ...args);
    };
  };

  /**
   *
   */
  private getWorkerConf = (beeDef: BeeDef) => {
    if (!path.isAbsolute(beeDef.filename)) {
      err("filename must be absolute.", beeDef.filename);
    }

    const getAbsoluteSourceFile = this.deps.getAbsoluteSourceFile ?? getAbsoluteSourceFile_live; // prettier-ignore

    //booter

    const realFilename =
      this.deps.customBooter ||
      getAbsoluteSourceFile(jacsConsumerMainDeclaration);

    //shared memory

    const dataArray = new Uint8Array(
      new SharedArrayBuffer(this.deps.maxSourceFileSize)
    );

    const tsPaths = this.deps.tsConfigPath
      ? this.deps.sfl.getTsConfigPaths(beeDef.filename)
      : undefined;

    const shared: WorkerData = {
      controlArray: getControlArray(),
      dataArray,
      channelToken: this.channelToken,
      next: beeDef,

      //config

      timeout: this.deps.consumerTimeout,
      softTimeout: this.deps.consumerSoftTimeout,
      tsPaths,
      resolveCache: this.resolveCache,
      doSourceMap: this.deps.doSourceMap,
    };

    return { realFilename, shared };
  };
}
