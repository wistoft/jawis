import { TestProvision } from "^jarun";
import { getTestListController } from "../_fixture";

//run serially

export default async (prov: TestProvision) => {
  const list = getTestListController(prov);

  await list.onRunAllTests();
  await list.onRunCurrentSelection();
};
