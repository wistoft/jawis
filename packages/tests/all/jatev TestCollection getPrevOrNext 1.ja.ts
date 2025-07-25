import { TestProvision } from "^jarun";
import { testSelectionToCollection_for_tests } from "^tests/_fixture";

export default ({ eq }: TestProvision) => {
  const c1 = testSelectionToCollection_for_tests([[{ id: "1" }]]);

  eq("1", c1.getPrevTest().id);
  eq("1", c1.getPrevTest("1").id);

  eq("1", c1.getNextTest().id);
  eq("1", c1.getNextTest("1").id);

  const c2 = testSelectionToCollection_for_tests([[], [{ id: "1" }]]);

  eq("1", c2.getPrevTest().id);
  eq("1", c2.getPrevTest("1").id);

  eq("1", c2.getNextTest().id);
  eq("1", c2.getNextTest("1").id);

  const c3 = testSelectionToCollection_for_tests([[{ id: "1" }], []]);

  eq("1", c3.getPrevTest().id);
  eq("1", c3.getPrevTest("1").id);

  eq("1", c3.getNextTest().id);
  eq("1", c3.getNextTest("1").id);

  //
  // 2
  //

  const c4 = testSelectionToCollection_for_tests([[{ id: "1" }, { id: "2" }]]);

  eq("2", c4.getPrevTest().id);
  eq("2", c4.getPrevTest("1").id);
  eq("1", c4.getPrevTest("2").id);

  eq("1", c4.getNextTest().id);
  eq("2", c4.getNextTest("1").id);
  eq("1", c4.getNextTest("2").id);

  const c5 = testSelectionToCollection_for_tests([
    [{ id: "1" }],
    [{ id: "2" }],
  ]);

  eq("2", c5.getPrevTest().id);
  eq("2", c5.getPrevTest("1").id);
  eq("1", c5.getPrevTest("2").id);

  eq("1", c5.getNextTest().id);
  eq("2", c5.getNextTest("1").id);
  eq("1", c5.getNextTest("2").id);
};
