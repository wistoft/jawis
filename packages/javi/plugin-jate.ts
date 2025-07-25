import {
  makeMakeRouter as makeMakeJatesRouter,
  MakeTestFramework,
  MakeTestFrameworkDeps,
  MakeTestFrameworks,
  TestFrameworkProv,
} from "^jates";

import { FileService } from "^jab";
import { JarunTestFramework } from "^jarun";
import { MainProv } from "^jab-node";
import {
  JaviService,
  JaviServiceNew,
  makeJarunTestRunners,
  RouterService,
} from "./internal";

/**
 *
 */
export const makeMakeTestFrameworks = async (
  javiService: JaviService
): Promise<MakeTestFrameworks> => {
  const jnew = javiService as JaviServiceNew;

  const honeyComb = await jnew.getService("@jawis/javi/honeyComb");

  const getAbsoluteSourceFile = jnew.tryGetRootConfig("@jawis/development/getAbsoluteSourceFile"); // prettier-ignore

  const testFrameworks = await javiService.getServiceType<MakeTestFramework>(
    "@jawis/jates/testFrameworks"
  );

  const outerDeps = {
    absJarunTestFolders: javiService.getRootConfig<string[]>("@jawis/jates/absJarunTestFolders"), // prettier-ignore
    absJarunTestLogFolder: javiService.getRootConfig<string>("@jawis/jates/absJarunTestLogFolder"), // prettier-ignore
    honeyComb,
    makeTsBee: await jnew.getService("@jawis/javi/makeTsBee"),
    onLog: await jnew.getService("@jawis/javi/sendLog"),
    getAbsoluteSourceFile,
  };

  return (jateProv: MakeTestFrameworkDeps) => {
    const frameworks: TestFrameworkProv[] = [];

    //quick fix - jarun should use the configuration to set this

    if (outerDeps.absJarunTestFolders) {
      frameworks.push(
        new JarunTestFramework({
          absTestFolders: outerDeps.absJarunTestFolders,
          absTestLogFolder: outerDeps.absJarunTestLogFolder,
          subFolderIgnore: ["node_modules"], //todo extract to conf
          runners: makeJarunTestRunners({
            ...jateProv,
            ...outerDeps,
          }),
          onError: jateProv.onError,
        })
      );
    }

    //fetch frameworks from configuration.

    for (const makeFramework of testFrameworks) {
      frameworks.push(makeFramework(jateProv));
    }

    return frameworks;
  };
};

/**
 *
 */
export const jatesRouterService: RouterService = async (javiService) => {
  const fileService = await javiService.getService<FileService>( "@jawis/javi/fileService" ); // prettier-ignore
  const mainProv = await javiService.getService<MainProv>("@jawis/javi/mainProv"); // prettier-ignore

  const makeTestFrameworks = await makeMakeTestFrameworks(javiService);

  const func = makeMakeJatesRouter({
    tecTimeout: javiService.getRootConfig("@jawis/jates/tecTimeout"),
    makeTestFrameworks,
    externalBeeLogSource: {
      getBufferedLogEntries: () => {
        return [];
      },
    },
    ...fileService,
    ...mainProv,
  });

  return func();
};
