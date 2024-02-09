import { objMap } from "^jab";
import { TestProvision } from "^jarun";
import { getHtml } from "^misc/node";
import { defaultConf } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(defaultConf.mapToAtoms);
  imp(defaultConf.atoms);
  imp(
    objMap(defaultConf.mapToFinal, (key, value) => {
      if (typeof value === "string") {
        return value;
      } else {
        return getHtml(value);
      }
    })
  );
};
