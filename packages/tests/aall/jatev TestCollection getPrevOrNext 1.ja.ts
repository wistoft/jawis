import { TestProvision } from "^jarun";
import { testSelectionToCollection } from "^jatev/TestCollection";

export default ({ eq }: TestProvision) => {
  const c1 = testSelectionToCollection([[{ id: "1" }]]);

  eq({ id: "1" }, c1.getPrevTest());
  eq({ id: "1" }, c1.getPrevTest("1"));

  eq({ id: "1" }, c1.getNextTest());
  eq({ id: "1" }, c1.getNextTest("1"));

  const c2 = testSelectionToCollection([[], [{ id: "1" }]]);

  eq({ id: "1" }, c2.getPrevTest());
  eq({ id: "1" }, c2.getPrevTest("1"));

  eq({ id: "1" }, c2.getNextTest());
  eq({ id: "1" }, c2.getNextTest("1"));

  const c3 = testSelectionToCollection([[{ id: "1" }], []]);

  eq({ id: "1" }, c3.getPrevTest());
  eq({ id: "1" }, c3.getPrevTest("1"));

  eq({ id: "1" }, c3.getNextTest());
  eq({ id: "1" }, c3.getNextTest("1"));

  //
  // 2
  //

  const c4 = testSelectionToCollection([[{ id: "1" }, { id: "2" }]]);

  eq({ id: "2" }, c4.getPrevTest());
  eq({ id: "2" }, c4.getPrevTest("1"));
  eq({ id: "1" }, c4.getPrevTest("2"));

  eq({ id: "1" }, c4.getNextTest());
  eq({ id: "2" }, c4.getNextTest("1"));
  eq({ id: "1" }, c4.getNextTest("2"));

  const c5 = testSelectionToCollection([[{ id: "1" }], [{ id: "2" }]]);

  eq({ id: "2" }, c5.getPrevTest());
  eq({ id: "2" }, c5.getPrevTest("1"));
  eq({ id: "1" }, c5.getPrevTest("2"));

  eq({ id: "1" }, c5.getNextTest());
  eq({ id: "2" }, c5.getNextTest("1"));
  eq({ id: "1" }, c5.getNextTest("2"));
};
