import { BeeMain } from "^bee-common";
import { TestProvision } from "^jarun";
import { AbsoluteFile } from "^jabc/diverse";
import { consoleLog, runJacsBee_test } from "../_fixture";

//exported main function gets worker data.

export default (prov: TestProvision) =>
  runJacsBee_test(prov, {
    def: { filename: __filename as AbsoluteFile, data: "hej" },
  });

/**
 * - prints the worker data jacs delivers for the script.
 */
export const main: BeeMain = ({ beeData }) => {
  consoleLog("workerData in main:", beeData);
};
