import { unknownToErrorData } from "^jab";
import { TestProvision } from "^jarun";

import { filterErrorDataStack } from "../_fixture";

export default ({ imp }: TestProvision) => {
  //handle unknown data

  imp(filterErrorDataStack(unknownToErrorData("hejsa")));

  //info is cloned

  const info = [1, 2];
  const data = unknownToErrorData(new Error("hej"), info);

  info.push(3); //this must not be reflected in ErrorData.

  imp(filterErrorDataStack(data));
};
