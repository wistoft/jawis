import { BeeDef } from "^bee-common";
import { ResolveCacheMap } from "^cached-resolve";
import { TsPathsConfig } from "^ts-config-util";

export type WorkerData = {
  controlArray: Int32Array;
  dataArray: Uint8Array;
  channelToken: string | number; //used for both jacs-compile and bee-log messages.

  timeout: number;
  softTimeout: number;
  stackTraceLimit?: number;
  doSourceMap: boolean;
  tsPaths?: TsPathsConfig;
  resolveCache?: ResolveCacheMap;

  next: BeeDef;
};

export type ConsumerMessage = {
  compileRequest: string | number;
  file: string;
};
