import { MakeBee } from "^bee-common";
import { JaviServiceNew, Plugin, Service } from "^javic";
import { GetUrlToRequire } from "^jab";

import { makeBrowserBeeFrost } from "./internal";

//duplicated because the real type has: `makeRouter: () => express.Router`
export type WebCsService = {
  getUrlToRequire: GetUrlToRequire;
  webCsUrl: string;
};

/**
 *
 */
export const makeBrowserBeeFrostPlugin = (): Plugin<MakeBee> => {
  //This service is needed so it can be shared between router and makeBrowserBee
  const privateService: Service<ReturnType<typeof makeBrowserBeeFrost>> = {
    type: "service",
    make: async (javiService) => {
      const jnew = javiService as JaviServiceNew;

      const webcs = await javiService.getService<WebCsService>("@jawis/webcs");
      const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore

      return makeBrowserBeeFrost({
        getUrlToRequire: webcs.getUrlToRequire,
        webCsUrl: webcs.webCsUrl,
        ...mainProv,
      });
    },
  };

  return {
    service: {
      type: "service",
      make: async (javiService) => (await javiService.servishFromDeclaration(privateService)).makeBrowserBee, // prettier-ignore
    },
    router: {
      path: "/jabro",
      make: async (javiService) => (await javiService.servishFromDeclaration(privateService)).makeJabroRouter(), // prettier-ignore
    },
  };
};
