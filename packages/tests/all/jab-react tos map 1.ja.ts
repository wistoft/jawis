import { objMap } from "^jab";
import { getHtmlRTR } from "^misc/node";
import { TestProvision } from "^jarun";
import { defaultConf } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(defaultConf.mapToAtoms);
  imp(defaultConf.atoms);
  imp(
    objMap(defaultConf.mapToFinal, (key, value) => {
      if (typeof value === "string") {
        return value;
      } else {
        return getHtmlRTR(value);
      }
    })
  );
};
