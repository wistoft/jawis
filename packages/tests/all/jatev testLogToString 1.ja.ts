import { TestProvision } from "^jarun";
import {
  capturedToString,
  capturedArrayToString,
} from "^jatev/ViewTestLogContent";

export default (prov: TestProvision) => {
  prov.eq("", capturedArrayToString([]));
  prov.eq("", capturedToString());

  prov.imp(capturedArrayToString([null]));
  prov.imp(capturedToString(null));
};
