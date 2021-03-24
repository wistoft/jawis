import { TestProvision } from "^jarun";
import { clonedToString, clonedArrayToString } from "^jatev/ViewTestLogContent";

export default (prov: TestProvision) => {
  prov.eq("", clonedArrayToString([]));
  prov.eq("", clonedToString());

  prov.imp(clonedArrayToString([null]));
  prov.imp(clonedToString(null));
};
