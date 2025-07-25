import fs from "node:fs";
import path from "node:path";
import filewatcher from "filewatcher";
import { listFilesNonRecursive } from "^jab-node";
import { BeeMain, BeeProv } from "^bee-common";
import { LogEntry, assertEq } from "^jab";
import { projectRoot } from "^dev/project.conf";

const jagoLogFolder = path.join(projectRoot, "jago_log_folder");

/**
 *
 */
export const main: BeeMain = async (prov) => {
  watchJagoFolder(prov);
};

/**
 *
 */
const watchJagoFolder = (prov: BeeProv) => {
  const traverseFolder = makeTraverseFolder(prov);

  //watcher

  const watcher = filewatcher();

  watcher.on("change", traverseFolder);

  watcher.on("fallback", () => {
    throw new Error("filewatcher fallback");
  });

  watcher.add(jagoLogFolder);
};

/**
 *
 */
export const makeTraverseFolder = (prov: BeeProv) => async (folder: string) => {
  assertEq(folder, jagoLogFolder);

  const files = await listFilesNonRecursive(jagoLogFolder);

  for (const file of files) {
    const entry = await getJagoLogEntryFromFile(file);

    prov.sendLog(entry as LogEntry);
  }
};

/**
 *
 */
export const getJagoLogEntryFromFile = async (file: string) => {
  const json = (await fs.promises.readFile(file)).toString();

  const logEntry = JSON.parse(json);

  await fs.promises.unlink(file);

  return logEntry;
};
