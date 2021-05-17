import { ScriptDefinition } from "^jagos";

/**
 * - Explicitly duplicated here, to avoid depending on javi client.
 */
export type JaviClientConf = {
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;
};

export type FullJaviConf = {
  port: number;
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;

  //jate
  absTestFolder: string;
  absTestLogFolder: string;
  tecTimeout: number;

  //jago
  scriptFolders: string[];
  scripts: ScriptDefinition[];
};
