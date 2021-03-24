import { TestProvision } from "^jarun";
import { dynamicDiff_test } from "../_fixture";

export default ({ eq }: TestProvision) => {
  //
  // []
  //

  eq([], dynamicDiff_test([], []));

  eq([["ins", "hej"]], dynamicDiff_test([], ["hej"]));

  eq([["ins", "hej"], ["ins", "hej"]], dynamicDiff_test([], ["hej", "hej"])); // prettier-ignore
  eq([["ins", "hej"], ["ins", "dav"]], dynamicDiff_test([], ["hej", "dav"])); // prettier-ignore

  //
  // ["hej"]
  //

  eq([["del", "hej"]], dynamicDiff_test(["hej"], []));

  eq([["eq", "hej"]], dynamicDiff_test(["hej"], ["hej"]));
  eq([["del", "hej"], ["ins", "dav"]], dynamicDiff_test(["hej"], ["dav"])); // prettier-ignore

  eq([["eq", "hej"], ["ins", "hej"]], dynamicDiff_test(["hej"], ["hej", "hej"])); // prettier-ignore
  eq([["eq", "hej"], ["ins", "dav"]], dynamicDiff_test(["hej"], ["hej", "dav"])); // prettier-ignore
  eq([["ins", "dav"], ["eq", "hej"]], dynamicDiff_test(["hej"], ["dav", "hej"])); // prettier-ignore
  eq([["del", "hej"], ["ins", "dav"], ["ins", "dav"]], dynamicDiff_test(["hej"], ["dav", "dav"])); // prettier-ignore

  eq([["eq", "hej"], ["ins", "hej"], ["ins", "hej"]], dynamicDiff_test(["hej"], ["hej", "hej", "hej"])); // prettier-ignore
  eq([["eq", "hej"], ["ins", "hej"], ["ins", "dav"]], dynamicDiff_test(["hej"], ["hej", "hej", "dav"])); // prettier-ignore
  eq([["eq", "hej"], ["ins", "dav"], ["ins", "hej"]], dynamicDiff_test(["hej"], ["hej", "dav", "hej"])); // prettier-ignore
  eq([["eq", "hej"], ["ins", "dav"], ["ins", "dav"]], dynamicDiff_test(["hej"], ["hej", "dav", "dav"])); // prettier-ignore
  eq([["del", "dav"], ["ins", "hej"], ["ins", "hej"], ["ins", "hej"]], dynamicDiff_test(["dav"], ["hej", "hej", "hej"])); // prettier-ignore
  eq([["ins", "hej"], ["ins", "hej"],["eq", "dav"]], dynamicDiff_test(["dav"], ["hej", "hej", "dav"])); // prettier-ignore
  eq([["ins", "hej"], ["eq", "dav"], ["ins", "hej"]], dynamicDiff_test(["dav"], ["hej", "dav", "hej"])); // prettier-ignore
  eq([["ins", "hej"], ["eq", "dav"], ["ins", "dav"]], dynamicDiff_test(["dav"], ["hej", "dav", "dav"])); // prettier-ignore

  //
  // ["hej", "dav"]
  //

  eq([["del", "hej"],  ["del", "dav"]], dynamicDiff_test(["hej", "dav"], [])); // prettier-ignore

  eq([["eq", "hej"],  ["del", "dav"]], dynamicDiff_test(["hej", "dav"], ["hej"])); // prettier-ignore
  eq([["del", "hej"],  ["eq", "dav"]], dynamicDiff_test(["hej", "dav"], ["dav"])); // prettier-ignore

  eq([["eq", "hej"],  ["del", "dav"], ["ins", "hej"]], dynamicDiff_test(["hej", "dav"], ["hej", "hej"])); // prettier-ignore
  eq([["eq", "hej"],  ["eq", "dav"]], dynamicDiff_test(["hej", "dav"], ["hej", "dav"])); // prettier-ignore
  eq([["del", "hej"],  ["eq", "dav"], ["ins", "hej"]], dynamicDiff_test(["hej", "dav"], ["dav", "hej"])); // prettier-ignore
  eq([["del", "hej"],  ["eq", "dav"], ["ins", "dav"]], dynamicDiff_test(["hej", "dav"], ["dav", "dav"])); // prettier-ignore
};
