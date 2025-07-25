import { TestFrameworkProv, TestLogController } from "^jates";
import { JaviService, JaviServiceNew } from "^javic";
import { assertAbsolute } from "^jab-node";
import { RustAdapter } from "./internal";

/**
 * Javi and jate plugin
 */
export const javiJateRust = {
  type: "@jawis/jates/testFrameworks",
  make: async (javiService: JaviService) => {
    const jnew = javiService as JaviServiceNew;

    const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore
    const onLog = await jnew.getService("@jawis/javi/sendLog"); // prettier-ignore

    return (): TestFrameworkProv => {
      const absTestLogFolder = javiService.getRootConfig<string>("@jawis/jates/absJarunTestLogFolder"); // prettier-ignore
      const absTestFolder = javiService.getRootConfig<string>("@jawis/jate-rust/absTestFolder"); // prettier-ignore

      const testLogController = new TestLogController({ absTestLogFolder, ...mainProv, }); // prettier-ignore

      return new RustAdapter({
        absTestFolder: assertAbsolute(absTestFolder),
        onLog,
        finally: mainProv.finalProv.finally,
        testLogController,
      });
    };
  },
};
