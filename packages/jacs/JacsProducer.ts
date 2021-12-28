import path from "path";
import { Worker, WorkerOptions } from "worker_threads";
import {
  err,
  FinallyFunc,
  getRandomInteger,
  safeCatch,
  unknownToErrorData,
  WorkerBeeDeps,
} from "^jab";
import {
  getFileToRequire,
  JabWorker,
  MakeNodeWorker,
  makePlainWorker,
  makeSharedResolveMap,
} from "^jab-node";
import type { SharedMap } from "sharedmap";

import { getControlArray, setCompiling, signalConsumerSync } from "./protocol";
import { SourceFileLoader } from "./SourceFileLoader";

import { ConsumerMessage, WorkerData } from ".";

export type JacsProducerDeps = {
  consumerTimeout: number;
  consumerSoftTimeout: number;
  maxSourceFileSize: number;
  customBooter?: string;
  sfl: Pick<SourceFileLoader, "load" | "getTsConfigPaths">;
  cacheNodeResolve: boolean;
  onError: (error: unknown) => void;
  finally: FinallyFunc;

  //for development

  notify?: typeof Atomics.notify;
  makeWorker?: MakeNodeWorker;
  unregisterTsInWorker?: boolean; // default false
};

/**
 *
 */
export class JacsProducer {
  private resolveCache?: SharedMap;
  private makeWorker;
  private jacsCompileToken;

  constructor(private deps: JacsProducerDeps) {
    this.makeWorker = this.deps?.makeWorker || makePlainWorker;

    if (deps.cacheNodeResolve) {
      this.resolveCache = makeSharedResolveMap();
    }

    this.jacsCompileToken = getRandomInteger();
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
   * Make a worker thread, that compiles TypeScript automatically.
   *
   * - WorkerData is given to the script, if it exports a `main` function.
   *
   * impl
   *  - Filter out compile messages, so the users don't see them.
   */
  public makeTsWorker: MakeNodeWorker = (
    filename: string,
    options: WorkerOptions = {}
  ) => {
    const { realFilename, shared } = this.getWorkerConf(
      filename,
      options.workerData
    );

    const worker = this.makeWorker(realFilename, {
      ...options,
      workerData: shared,
    });

    //on message

    const onMessage = (msg: ConsumerMessage) => {
      if (msg.jacsCompileToken === this.jacsCompileToken) {
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
   */
  public makeJacsWorkerBee = <MS, MR>(beeDeps: WorkerBeeDeps<MR>) => {
    const { realFilename, shared } = this.getWorkerConf(
      beeDeps.filename,
      beeDeps.workerData
    );

    //on message

    const onMessage = (msg: ConsumerMessage) => {
      if (msg.jacsCompileToken === this.jacsCompileToken) {
        this.onCompile(shared.controlArray, shared.dataArray, msg.file);
      } else {
        //the message belongs to the user.

        beeDeps.onMessage((msg as unknown) as MR);
      }
    };

    //worker

    return new JabWorker<MS, ConsumerMessage, WorkerData>({
      filename: realFilename,
      workerData: shared,
      onMessage,
      onStdout: beeDeps.onStdout,
      onStderr: beeDeps.onStderr,
      onError: beeDeps.onError,
      onExit: beeDeps.onExit,
      finally: beeDeps.finally,
      makeWorker: this.makeWorker,
    });
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
          //only send, if it's no jacs who send the message.
          if (msg.type !== this.jacsCompileToken) {
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
  private getWorkerConf = (filename: string, workerData: unknown) => {
    if (!path.isAbsolute(filename)) {
      err("filename must be absolute.", filename);
    }

    //booter

    const realFilename =
      this.deps.customBooter || getFileToRequire(__dirname, "JacsConsumerMain");

    //shared memory

    const dataArray = new Uint8Array(
      new SharedArrayBuffer(this.deps.maxSourceFileSize)
    );

    const shared: WorkerData = {
      controlArray: getControlArray(),
      dataArray,
      timeout: this.deps.consumerTimeout,
      softTimeout: this.deps.consumerSoftTimeout,
      jacsCompileToken: this.jacsCompileToken,

      tsPaths: this.deps.sfl.getTsConfigPaths(filename),
      resolveCache: this.resolveCache,

      beeFilename: filename,
      beeWorkerData: workerData,

      //for developement
      unregister: this.deps?.unregisterTsInWorker || false,
    };

    return { realFilename, shared };
  };
}
