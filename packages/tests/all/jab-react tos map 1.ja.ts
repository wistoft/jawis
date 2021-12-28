import { objMap } from "^jab";
import { getHtmlRTR } from "^misc/node";
import { TestProvision } from "^jarun";
import { getDefaultConf } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getDefaultConf().mapToAtoms);
  imp(getDefaultConf().atoms);
  imp(
    objMap(getDefaultConf().mapToFinal, (key, value) => {
      if (typeof value === "string") {
        return value;
      } else {
        return getHtmlRTR(value);
      }
    })
  );
};
