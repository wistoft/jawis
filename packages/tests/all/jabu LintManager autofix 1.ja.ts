import { TestProvision } from "^jarun";
import { getLintManager, getScriptPath } from "^tests/_fixture/index";

//gather autofixes from plugins

export default async (prov: TestProvision) => {
  const manager = getLintManager(prov, {
    plugins: [
      () => ({
        includeFile: () => true,
        mapFile: () => "some new content",
      }),
    ],
  });

  prov.res("some new content", manager.getAutofixes(getScriptPath("hello.js")));
};
