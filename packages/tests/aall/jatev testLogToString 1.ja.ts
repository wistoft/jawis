import { testLogsEqual } from "^jatec";
import { TestProvision } from "^jarun";
import { errorData1 } from "../_fixture";
import { clonedToString, clonedArrayToString } from "^jatev/ViewTestLogContent";

export default (prov: TestProvision) => {
  prov.eq("", clonedArrayToString([]));
  prov.eq("", clonedToString());

  prov.imp(clonedArrayToString([null]));
  prov.imp(clonedToString(null));
};
