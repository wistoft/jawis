import { BeeMain } from "^bee-common";
import { JarunProcessMainImpl } from "./internal";

/**
 *
 */
export const main: BeeMain = (prov) => {
  new JarunProcessMainImpl(prov);
};
