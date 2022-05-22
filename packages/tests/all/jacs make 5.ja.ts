import { BeeMain } from "^jabc";
import { TestProvision } from "^jarun";
import { makeJacs_lazy } from "../_fixture";

//exported main function gets worker data.

export default (prov: TestProvision) =>
  makeJacs_lazy(prov, undefined as any, {
    def: { filename: __filename, data: "hej" },
  });

/**
 * - prints the worker data jacs delivers for the script.
 */
export const main: BeeMain = ({ beeData }) => {
  console.log("workerData in main:", beeData);
};
