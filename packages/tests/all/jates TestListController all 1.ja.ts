import { TestProvision } from "^jarun";
import { getTestListController } from "../_fixture/index";

//run onRunAllTests concurrent

export default (prov: TestProvision) => {
  const list = getTestListController(prov);

  list.onRunAllTests();
  list.onRunAllTests();
};
