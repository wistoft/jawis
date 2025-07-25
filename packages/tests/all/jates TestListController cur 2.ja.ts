import { TestProvision } from "^jarun";
import { getTestListController } from "../_fixture/index";

//last request trumps

export default (prov: TestProvision) => {
  const list = getTestListController(prov);

  list.onRunAllTests();
  list.onRunCurrentSelection();
};
