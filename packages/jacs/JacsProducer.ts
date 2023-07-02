import { unknownToErrorData } from "^jab";
import {
  getFileToRequire,
  JabWorker,
  MakeNodeWorker,
  makePlainWorker,
} from "^jab-node";

import { FinallyFunc } from "^finally-provider";
import { safeCatch } from "^yapu";
import { BeeDeps } from "^bee-common";
import { makeSharedResolveMap } from "^cached-resolve";

import {
  getControlArray,
  setCompiling,
  signalConsumerSync,
  SourceFileLoader,
  ConsumerMessage,
  WorkerData,
} from "./internal";

export type JacsProducerDeps = {
  consumerTimeout: number;
  consumerSoftTimeout: number;
  maxSourceFileSize: number;
  customBooter?: string;
  sfl: Pick<SourceFileLoader, "load" | "getTsConfigPaths">;
  experimentalCacheNodeResolve?: boolean;
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
  private resolveCache?: ReturnType<typeof makeSharedResolveMap>;

  constructor(private deps: JacsProducerDeps) {
    if (deps.experimentalCacheNodeResolve) {
      this.resolveCache = makeSharedResolveMap();
    }
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
    //booter

    const filename =
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
      beeFilename: beeDeps.filename,
      tsPaths: this.deps.sfl.getTsConfigPaths(beeDeps.filename),
      experimentalResolveCache: this.resolveCache,

      //for developement
      unregister: this.deps?.unregisterTsInWorker || false,
    };

    //on message

    const onMessage = (msg: ConsumerMessage) => {
      switch (msg.type) {
        case "jacs-compile":
          this.onCompile(shared.controlArray, shared.dataArray, msg.file);
          return;

        default:
          //the message belongs to the user.

          beeDeps.onMessage(msg as unknown as MR);
      }
    };

    //worker

    return new JabWorker<MS, ConsumerMessage, WorkerData>({
      filename,
      workerData: shared,
      onMessage,
      onStdout: beeDeps.onStdout,
      onStderr: beeDeps.onStderr,
      onError: beeDeps.onError,
      onExit: beeDeps.onExit,
      finally: beeDeps.finally,
      makeWorker: this.deps?.makeWorker || makePlainWorker,
    });
  };
}
