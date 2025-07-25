import { TestFrameworkProv, TestLogController } from "^jates";
import { JaviService, JaviServiceNew } from "^javic";

import { PHPUnitAdapter } from "./internal";
import { assertAbsolute, makeAbsolute } from "^jab-node";

/**
 * Javi and jate plugin
 */
export const javiJatePhpUnit = {
  type: "@jawis/jates/testFrameworks",
  make: async (javiService: JaviService) => {
    const jnew = javiService as JaviServiceNew;

    const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore
    const onLog = await jnew.getService("@jawis/javi/sendLog"); // prettier-ignore

    return (): TestFrameworkProv => {
      const absTestLogFolder = javiService.getRootConfig<string>("@jawis/jates/absJarunTestLogFolder"); // prettier-ignore

      const testLogController = new TestLogController({ absTestLogFolder, ...mainProv, }); // prettier-ignore

      // todo: take test folder from config

      return new PHPUnitAdapter({
        absTestFolder: makeAbsolute(
          __dirname,
          "../dev/devServer/tests-phpunit"
        ),
        onLog,
        finally: mainProv.finalProv.finally,
        testLogController,
      });
    };
  },
};
