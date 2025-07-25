import fs from "node:fs";
import path from "node:path";
import fastGlob from "fast-glob";
import { packagesPatternIncludingPrivate, projectRoot } from "../project.conf";
import { JarunTestFramework } from "^jarun";
import { BeeMain } from "^bee-common/types";
import { difference } from "^jab";

/**
 *
 */
export const main: BeeMain = async (prov) => {
  //very hacky
  const runners = {
    ".ww.ja.js": undefined,
    ".ww.ja.ts": undefined,
    ".ww.ja.jsx": undefined,
    ".ww.ja.tsx": undefined,
    ".ja.js": undefined,
    ".ja.ts": undefined,
    ".ja.jsx": undefined,
    ".ja.tsx": undefined,
    ".pr.js": undefined,
    ".pr.ts": undefined,
    ".wo.js": undefined,
    ".wo.ts": undefined,
    ".ww.js": undefined,
    ".ww.ts": undefined,
    ".cmd": undefined,
    ".ps1": undefined,
    ".php": undefined,
    ".go": undefined,
  } as any;

  const absTestFolder = path.join(projectRoot, "packages/tests/");
  const absTestLogFolder = path.join(projectRoot, "packages/tests/_testLogs");

  const jarun = new JarunTestFramework({
    absTestFolders: [absTestFolder],
    absTestLogFolder,
    subFolderIgnore: ["node_modules"],
    runners,
    onError: prov.onError,
  });

  //test logs

  const testLogs = await fs.promises.readdir(absTestLogFolder);

  //tests

  const test = await jarun
    .getTestInfo()
    .then((data) =>
      data.map(({ file }) =>
        path.basename((jarun.testLogController as any).getExpFilename(file))
      )
    );

  const toDelete = difference(testLogs, test);

  for (const file of toDelete) {
    fs.unlinkSync(path.join(absTestLogFolder, file));
  }

  console.log(toDelete.length + " files deleted");
};
