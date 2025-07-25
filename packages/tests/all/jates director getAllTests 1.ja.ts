import { TestProvision } from "^jarun";
import { getJatesDirector } from "^tests/_fixture/index";

export default (prov: TestProvision) =>
  getJatesDirector(prov).onClientMessage({ type: "getAllTests" });
