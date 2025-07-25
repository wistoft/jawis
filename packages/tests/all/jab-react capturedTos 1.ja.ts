import { capturedTos } from "^jab";
import { TestProvision } from "^jarun";

export default ({ imp }: TestProvision) => {
  imp(capturedTos(["resource", "stream"]));
};
