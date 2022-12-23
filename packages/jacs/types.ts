import { TsPathsConfig } from "^ts-config-util";

export type WorkerData = {
  controlArray: Int32Array;
  dataArray: Uint8Array;
  timeout: number;
  softTimeout: number;
  beeFilename?: string;
  stackTraceLimit?: number;
  tsPaths?: TsPathsConfig;

  //for development
  unregister: boolean;
};

export type ConsumerMessage = {
  type: "jacs-compile"; // this will clash with user's messages
  file: string;
};
