export type ClientRouteDef = { name: string; file: string };

/**
 *
 */
export type JaviClientConf = {
  siteTitle?: string;
  clientRoutes: Array<ClientRouteDef>;
  projectRoot: string;
  removePathPrefix: string;
  initialShowSystemFrames: boolean;
  showClearLink: boolean;
};
