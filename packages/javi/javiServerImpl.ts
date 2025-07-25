import { MainProv } from "^jab-node";

import { JaviClientConf, DeferredRoute, makeApp } from "./internal";

type Deps = {
  siteTitle: string;
  mainProv: MainProv;
  port: number;
  staticWebFolder: string;
  routes: DeferredRoute[];
  clientConf: JaviClientConf;
  indexHtml: string;
};

/**
 * - Makes conf available to client.
 * - Starts web server
 *
 */
export const startJaviServer = (deps: Deps) => {
  makeApp({
    ...deps,
    clientConf: {
      variable: "__JAVI_CLIENT_CONF",
      value: deps.clientConf,
    },
  }).then((app) => {
    // start server

    app.listen(deps.port, () =>
      deps.mainProv.log(deps.siteTitle + " port: " + deps.port)
    );
  });
};
