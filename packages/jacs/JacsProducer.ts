import { FinallyFunc, safeCatch, unknownToErrorData } from "^jab";
import {
  BeeDeps,
  getFileToRequire,
  JabWorker,
  MakeNodeWorker,
  makePlainWorker,
} from "^jab-node";

import { getControlArray, setCompiling, signalConsumerSync } from "./protocol";
import { SourceFileLoader } from "./SourceFileLoader";

import { ConsumerMessage, WorkerData } from ".";

export type JacsProducerDeps = {
  consumerTimeout: number;
  producerTimeout: number;
  maxSourceFileSize: number;
  customBooter?: string;
  sfl: Pick<SourceFileLoader, "load" | "getTsConfigPaths">;
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
  constructor(private deps: JacsProducerDeps) {}

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
        const data = unknownToErrorData(error); //only error message for the consumer.

        signalConsumerSync(
          "error",
          data.msg,
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
      beeFilename: beeDeps.filename,
      ...this.deps.sfl.getTsConfigPaths(beeDeps.filename),

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

          beeDeps.onMessage((msg as unknown) as MR);
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
