import fs from "fs";
import path from "path";
import { ComposedTestFramework } from "^jates";
import { TestLogController } from "^jates/TestLogController";
import { projectRoot } from "^dev/project.conf";
import { difference } from "./util";

/**
 *
 */
export const doit = async () => {
  //todo: get this configuration from javi configuration.

  const runners = {
    ".ja.js": undefined,
    ".ja.ts": undefined,
    ".ja.jsx": undefined,
    ".ja.tsx": undefined,
    ".pr.js": undefined,
    ".pr.ts": undefined,
    ".wo.js": undefined,
    ".wo.ts": undefined,
  } as any;

  const absTestFolder = path.join(projectRoot, "packages/tests/");
  const absTestLogFolder = path.join(projectRoot, "packages/tests/_testLogs");

  //the objects

  const jarun = new ComposedTestFramework({
    absTestFolder,
    subFolderIgnore: ["node_modules"],
    runners,
  });

  const testLogController = new TestLogController({
    absTestLogFolder,
    onError: console.log,
  });

  //test logs

  const testLogs = await fs.promises.readdir(absTestLogFolder);

  //tests

  const test = await jarun
    .getTestIds()
    .then((data) =>
      data.map((file) =>
        path.basename((testLogController as any).getExpFilename(file))
      )
    );

  const toDelete = difference(testLogs, test);

  for (const file of toDelete) {
    fs.unlinkSync(path.join(absTestLogFolder, file));
  }

  console.log(toDelete.length + " files deleted");
};

doit();
