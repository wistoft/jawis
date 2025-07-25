import path from "node:path";
import { BehatAdapter } from "^jate-behat";

import { TestProvision } from "^jarunc";
import { makeOnLog } from ".";

/**
 *
 */
export const getBehatTestFolder = () =>
  path.join(__dirname, "../testsuite-behat");

/**
 *
 */
export const getBehatAdapter = (prov: TestProvision) =>
  new BehatAdapter({
    absTestFolder: getBehatTestFolder(),
    onLog: makeOnLog(prov),
    finally: prov.finally,
  });
