import { TestProvision } from "^jarun";
import { getJatesDirector } from "^tests/_fixture/index";
import { sleeping } from "^yapu/yapu";

export default (prov: TestProvision) => {
  getJatesDirector(prov).onClientMessage({ type: "runAllTests" });

  //quick fix, because jates has no shutdown
  return sleeping(1000);
};
