import { PromiseAwait } from "^yapu";
import { TestProvision } from "^jarun";

// await nothing

export default (prov: TestProvision) => new PromiseAwait(prov).start();
