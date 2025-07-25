import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";

//bug: why doesn't this have long-traces?

export default (prov: TestProvision) => {
  setTimeout(() => {
    throw new Error("ups");
  }, 10);

  return sleeping(100);
};
