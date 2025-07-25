import express from "express";

import { CompileService, GetUrlToRequire } from "^jab";
import { JaviServiceNew, Plugin, Service } from "^javic";
import { makeWebcs } from "./internal";

export type WebCsService = {
  getUrlToRequire: GetUrlToRequire;
  makeRouter: () => express.Router;
  webCsUrl: string;
};

/**
 *
 */
export const makeWebCsRoutePlugin = (): Plugin<WebCsService> => {
  const mountPath = "webcs";

  const decl: Service<WebCsService> = {
    type: "service",
    make: async (javiService) => {
      const jnew = javiService as JaviServiceNew;

      const port = jnew.getRootConfig("@jawis/javi/port");
      const staticWebFolder = jnew.getRootConfig("@jawis/javi/staticWebFolder"); // prettier-ignore
      const compileService = await javiService.getService<CompileService>("@jawis/compileService"); // prettier-ignore

      return makeWebcs({
        port,
        mountPath,
        staticWebFolder,
        compileService,
      });
    },
  };

  return {
    service: decl,
    router: {
      path: "/" + mountPath,
      make: async (javiService) => (await javiService.servishFromDeclaration(decl)).makeRouter(), // prettier-ignore
    },
  };
};
