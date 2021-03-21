import { assertPropBoolean, assertPropString } from "^jab";
import { JaviClientConf } from "./types";

//send by server on /conf.js
declare const __JAVI_CLIENT_CONF: unknown;

/**
 *
 */
export const getClientConf = (): JaviClientConf => {
  const conf = __JAVI_CLIENT_CONF;

  const projectRoot = assertPropString(conf, "projectRoot");
  const removePathPrefix = assertPropString(conf, "removePathPrefix");
  const initialShowSystemFrames = assertPropBoolean( conf, "initialShowSystemFrames" ); // prettier-ignore
  const showClearLink = assertPropBoolean(conf, "showClearLink");

  return {
    projectRoot,
    removePathPrefix,
    initialShowSystemFrames,
    showClearLink,
  };
};
