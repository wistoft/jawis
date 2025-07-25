import { TestProvision } from "^jarun";
import { getTestIdx } from "^jatev/TestCollection";
import { testSelectionToCollection_for_tests } from "^tests/_fixture";

export default ({ eq }: TestProvision) => {
  eq(
    [0, 0],
    getTestIdx(testSelectionToCollection_for_tests([["1"]]).tests, "1")
  );

  eq([1, 0], getTestIdx(testSelectionToCollection_for_tests([[], [ "1" ]]).tests, "1")); // prettier-ignore

  eq([0, 0], getTestIdx(testSelectionToCollection_for_tests([[ "1" ], [ "2" ]]).tests, "1")); // prettier-ignore
  eq([1, 0], getTestIdx(testSelectionToCollection_for_tests([[ "1" ], [ "2" ]]).tests, "2")); // prettier-ignore

  eq([1, 0], getTestIdx(testSelectionToCollection_for_tests([[], [ "1" ,  "2" ]]).tests, "1")); // prettier-ignore
  eq([1, 1], getTestIdx(testSelectionToCollection_for_tests([[], [ "1" ,  "2" ]]).tests, "2")); // prettier-ignore
};
