import { TsConfigPaths } from "./ts-util";

export type WorkerData = {
  controlArray: Int32Array;
  dataArray: Uint8Array;
  timeout: number;
  beeFilename: string;

  //for development
  unregister: boolean;
} & TsConfigPaths;

export type ConsumerMessage = {
  type: "jacs-compile"; // this will clash with user's messages
  file: string;
};
