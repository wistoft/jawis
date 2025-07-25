import {
  assertProp,
  assertPropBoolean,
  assertPropString,
  tryPropString,
} from "^jab";

import { JaviClientConf } from "^javic";

//send by server on /conf.js
declare const __JAVI_CLIENT_CONF: unknown;

/**
 *
 */
export const getClientConf = (): JaviClientConf => {
  const conf = __JAVI_CLIENT_CONF;

  //just a sanity check for some javis configuration. There might be more for other modules
  tryPropString(conf, "siteTitle");
  assertProp(conf, "clientRoutes");
  assertPropString(conf, "projectRoot");
  assertPropString(conf, "removePathPrefix");
  assertPropBoolean( conf, "initialShowSystemFrames" ); // prettier-ignore
  assertPropBoolean(conf, "showClearLink");

  return conf as JaviClientConf;
};
