import { TestFrameworkProv, TestLogController } from "^jates";
import { JaviService, JaviServiceNew } from "^javic";
import { BehatAdapter } from "./internal";

/**
 * Javi and jate plugin
 */
export const javiJateBehat = {
  type: "@jawis/jates/testFrameworks",
  make: async (javiService: JaviService) => {
    const jnew = javiService as JaviServiceNew;

    const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore
    const onLog = await jnew.getService("@jawis/javi/sendLog"); // prettier-ignore

    return (): TestFrameworkProv => {
      const absTestLogFolder = javiService.getRootConfig<string>("@jawis/jates/absJarunTestLogFolder"); // prettier-ignore
      const absTestFolder = javiService.getRootConfig<string>("@jawis/jate-behat/absTestFolder"); // prettier-ignore

      const testLogController = new TestLogController({ absTestLogFolder, ...mainProv, }); // prettier-ignore

      return new BehatAdapter({
        absTestFolder,
        onLog,
        finally: mainProv.finalProv.finally,
        testLogController,
      });
    };
  },
};
