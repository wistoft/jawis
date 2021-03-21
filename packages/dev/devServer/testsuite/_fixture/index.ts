import { TestProvision } from "^jarun";
import { sleeping, tryProp } from "^jab";

export const SLOWNESS = 0;

export const dummyTest = (prov: TestProvision) => {
  prov.imp("new stuff");
  return sleeping(SLOWNESS);
};
//
