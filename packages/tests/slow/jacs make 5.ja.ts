import { TestProvision } from "^jarun";
import { makeJacs_lazy } from "../_fixture";

//exported main function gets worker data.

export default (prov: TestProvision) =>
  makeJacs_lazy(prov, __filename, {
    workerData: "hej",
  });

/**
 * - prints the worker data jacs delivers for the script.
 */
export const main = ({ workerData }: any) => {
  console.log("workerData in main:", workerData);
};
