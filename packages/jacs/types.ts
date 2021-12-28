import { TsPathsConfig } from "./ts-util";
import type { SharedMap } from "sharedmap";

export type WorkerData = {
  controlArray: Int32Array;
  dataArray: Uint8Array;
  timeout: number;
  softTimeout: number;
  jacsCompileToken: string | number;

  stackTraceLimit?: number;
  tsPaths?: TsPathsConfig;
  resolveCache?: SharedMap;

  beeFilename?: string;
  beeWorkerData?: unknown;

  //for development
  unregister?: boolean;
};

export type ConsumerMessage = {
  jacsCompileToken: string | number;
  file: string;
};

//place somewhere general
export type CompileService = {
  load: (absPath: string) => Promise<string>;
};
