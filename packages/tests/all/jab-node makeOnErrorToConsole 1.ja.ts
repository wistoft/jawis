import { onError } from "^main-wrapper";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  onError("dummy error");
};
