import { TestProvision } from "^jarun";
import {
  filterAbsoluteFilepath,
  getManager,
  getScriptPath,
} from "^tests/_fixture/index";

// sub managers get file-change events, for files that have changed since last online.

export default async (prov: TestProvision) => {
  const manager = getManager(prov, {
    subManagers: [
      (deps) => {
        deps.pfs.awaitFileChange().then(() => {
          const files = deps.pfs.getDirtyFiles().map(filterAbsoluteFilepath);

          console.log({ subManager1: files });
        });

        return {};
      },
    ],
    storage: {
      filesWatched: new Map([[getScriptPath("hello.js"), "some content"]]),
    },
  });

  await manager.start();

  return manager.shutdown();
};
