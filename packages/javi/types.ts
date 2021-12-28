import { ScriptDefinition } from "^jagos";

/**
 * - Explicitly duplicated here, to avoid depending on javi client.
 */
export type JaviClientConf = {
  siteTitle?: string;
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;
};

export type FullJaviConf = {
  siteTitle: string;
  port: number;
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;
  vsCodeBinary: string;
  winMergeBinary: string;

  //jate
  absTestFolder: string;
  absTestLogFolder: string;
  tecTimeout: number;

  //jago
  scriptFolders: string[];
  scripts: ScriptDefinition[];
};
