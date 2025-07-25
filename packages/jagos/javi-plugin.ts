import { JaviServiceNew, RouterService } from "^javic";
import { makeMakeRouter as makeMakeJagosRouter } from "./internal";

/**
 *
 */
export const jagosRouterService: RouterService = async (javiService) => {
  const jnew = javiService as JaviServiceNew;

  const getAbsoluteSourceFile = jnew.tryGetRootConfig("@jawis/development/getAbsoluteSourceFile"); // prettier-ignore
  const fileService = await jnew.getService( "@jawis/javi/fileService" ); // prettier-ignore
  const honeyComb = await jnew.getService( "@jawis/javi/honeyComb" ); // prettier-ignore
  const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore

  const func = makeMakeJagosRouter({
    scriptFolders: javiService.getRootConfig("@jawis/jagos/scriptFolders"),
    scripts: javiService.getRootConfig("@jawis/jagos/scripts"),
    honeyComb,
    showTime: true,
    getAbsoluteSourceFile,
    ...fileService,
    ...mainProv,
  });

  return func();
};
