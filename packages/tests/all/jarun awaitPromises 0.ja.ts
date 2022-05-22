import { PromiseAwait } from "^jab";
import { TestProvision } from "^jarun";

// await nothing

export default (prov: TestProvision) => new PromiseAwait(prov).start();
