import path from "node:path";

import { MainProv } from "^jab-node";
import { AbsoluteFile, Jsonable, pathJoin, tos } from "^jab";

import {
  JaviClientConf,
  FullJaviConf,
  DeferredRoute,
  FileServerService,
  makeJaviService,
  getJaviConf,
  getDefaultServiceConf,
} from "./internal";

/**
 *
 * 1. Get configuration from config file
 * 2. Make default service configuraton
 * 3. Make javi deps (incl. javi service instance)
 *      - Services are constructed on demand
 *      - Routes are constructed right away, so services will also, for now.
 * 4. Start server
 *
 */
export const makeJaviDeps = async (mainProv: MainProv) => {
  const staticWebFolder = path.join(__dirname, "client");

  //conf

  const conf = getJaviConf(process.cwd(), process.platform);

  //default things

  const serviceConfig = getDefaultServiceConf({
    conf,
    staticWebFolder,
    mainProv,
    sendLog: (msg) => {
      //this could be sent to the browser. (live javi could show it.)
      console.log("javi onLog");
      console.log(tos(msg));
    },
  });

  return makeJaviInnerDeps({
    conf,
    serviceConfig,
    mainProv,
    staticWebFolder,
    webpackPort: conf.port, // same as server port when live
  });
};

export type JaviInnerDepsDeps = {
  conf: FullJaviConf;
  serviceConfig: any;
  staticWebFolder: string;
  extraClientConf?: Jsonable;
  webpackPort: number;

  mainProv: MainProv;
  //move to service configuration
  scripsToInclude?: AbsoluteFile[];
};

/**
 *
 */
export const makeJaviInnerDeps = async (deps: JaviInnerDepsDeps) => {
  const { javiService, serverRouteDecls } = makeJaviService({
    ...deps,
    config: deps.serviceConfig,
  });

  //routes for the sites (not executed here)

  const routes: DeferredRoute[] = serverRouteDecls.map((route) => ({
    path: route.path,
    makeRouter: () => route.make(javiService),
  }));

  //client conf

  const javiClientConf: JaviClientConf = {
    siteTitle: deps.conf.siteTitle, //a way to declare service conf also as client conf. Then this is unneeded.
    clientRoutes: [
      // not implemented yet
      // { name: "new route", file: "/file/to/DummyComponent.js" },
    ],

    //rest should be moved into jate and jago
    projectRoot: deps.conf.projectRoot,
    removePathPrefix: deps.conf.removePathPrefix,
    initialShowSystemFrames: deps.conf.initialShowSystemFrames,
    showClearLink: deps.conf.showClearLink,
  };

  //files to include

  let scriptTags = "";

  if (deps.scripsToInclude) {
    const fileServer = await javiService.getService<FileServerService>(
      "@jawis/javi/filesServer"
    );

    //todo escape html
    scriptTags = deps.scripsToInclude
      .map((url) => `<script src="${pathJoin(fileServer.url, url)}"></script>`)
      .join("\n");
  }

  //index.html

  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Javi</title>
    <style>
      body {
        background-color: rgba(30, 30, 30);
      }
    </style>
    ${scriptTags}
    <script src="http://localhost:${deps.conf.port}/conf.js"></script>
    <script defer="defer" src="http://localhost:${deps.webpackPort}/app.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;

  return {
    ...deps,
    ...deps.conf,
    javiService,
    routes,
    indexHtml,
    clientConf: {
      ...javiClientConf,
      ...deps.extraClientConf,
    },
  };
};
