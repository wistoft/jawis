import { capture } from "^jab";
import { TestProvision } from "^jarun";
import { cloneTosGeneral_test } from "../_fixture";

export default ({ eq, imp }: TestProvision) => {
  eq("TRUE", cloneTosGeneral_test(true));
  eq("number-prefix1", cloneTosGeneral_test(1));

  //string

  eq("blank-string", cloneTosGeneral_test(""));
  eq("1", cloneTosGeneral_test("1"));
  eq("true", cloneTosGeneral_test("true"));

  // white space, etc

  eq("space", cloneTosGeneral_test(" "));
  eq("newline", cloneTosGeneral_test("\n"));
  eq("spacespace", cloneTosGeneral_test("  "));
  eq("spacetab", cloneTosGeneral_test(" \t"));
  eq("spacetabnewline", cloneTosGeneral_test(" \t\n"));
  eq("spaceaspace", cloneTosGeneral_test(" a "));
  eq("spaceanewline", cloneTosGeneral_test(" a\n"));
  eq("spacetabtabtabatab", cloneTosGeneral_test(" \t\t\ta\t"));

  //plain objects

  eq("()", cloneTosGeneral_test({}));
  imp(cloneTosGeneral_test({ hej: "dav" }));

  //arrays

  eq("<>", cloneTosGeneral_test(["value", []]));
  imp(cloneTosGeneral_test(["value", [1]]));
  imp(cloneTosGeneral_test(["value", [1, ["value", [{}]]]]));

  //specially encoded values

  eq("UNDEFINED", cloneTosGeneral_test(["undefined"]));
  eq("INFINITY", cloneTosGeneral_test(["Infinity"]));
  eq("NAN", cloneTosGeneral_test(["NaN"]));

  imp(cloneTosGeneral_test(capture(Object.create(null))));
  imp(cloneTosGeneral_test(capture(/regex/)));

  imp(cloneTosGeneral_test(["partial", null]));
};
