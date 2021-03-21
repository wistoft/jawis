import { assertPropInt } from "^jab";

export type DevClientConf = {
  serverPort: number;
  jagoConsolePortForDev: number;
};

//must be supplied by the build system.
declare const __DEV_CLIENT_CONF: DevClientConf;

/**
 * note
 *  - this is overkill, when variables are just in source code. But if one wants to compute
 *      something it is necessary to use define plugin.
 */
export const getDevClientConf = (): DevClientConf => {
  const conf = __DEV_CLIENT_CONF; //compile time variables.

  const serverPort = assertPropInt(conf, "serverPort");
  const jagoConsolePortForDev = assertPropInt(conf, "jagoConsolePortForDev");

  return { serverPort, jagoConsolePortForDev };
};
