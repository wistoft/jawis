import { TestProvision } from "^jarun";
import { def } from "^jab";

export default (prov: TestProvision) => {
  const str = `mikael
wistoft
mikael`;

  //
  // non-capturing groups
  //

  //non-capturing group's are still replaced
  prov.eq("x", "ab".replace(/(?:a)(b)/, "x"));

  //but they are removed from the groups, i.e. a is not in group $1
  prov.eq("b", "ab".replace(/(?:a)(b)/, "$1"));

  //works for match.
  prov.eq("b", def("ab".match(/(?:a)(b)/))[1]);

  //
  // no modifiers
  //
  //    ^$ match only start/end of string. Not lines.
  //    only one match is replaced.

  prov.eq("mikael\nwistoft\nmikael", str.replace(/fido/, ""));
  prov.eq("\nwistoft\nmikael", str.replace(/mikael/, ""));
  prov.eq("\nwistoft\nmikael", str.replace(/^mikael/, ""));

  prov.eq("mikael\nwistoft\n", str.replace(/mikael$/, ""));

  prov.eq("mikael\n\nmikael", str.replace(/wistoft/, ""));
  prov.eq("mikael\nwistoft\nmikael", str.replace(/^wistoft/, ""));
  prov.eq("mikael\nwistoft\nmikael", str.replace(/wistoft$/, ""));

  //
  // g modifiers
  //
  //    ^$ match only start/end of string. Not lines.
  //    all matches are replaced.

  prov.eq("mikael\nwistoft\nmikael", str.replace(/fido/g, ""));
  prov.eq("\nwistoft\n", str.replace(/mikael/g, ""));
  prov.eq("\nwistoft\nmikael", str.replace(/^mikael/g, ""));

  prov.eq("mikael\nwistoft\n", str.replace(/mikael$/g, ""));

  prov.eq("mikael\n\nmikael", str.replace(/wistoft/g, ""));
  prov.eq("mikael\nwistoft\nmikael", str.replace(/^wistoft/g, ""));
  prov.eq("mikael\nwistoft\nmikael", str.replace(/wistoft$/g, ""));

  //
  // replace one line 3
  //

  //simpel - men efter newline, når sidste line ikke har ending newline.
  // const _replaceALine = (str: string) =>
  //   str.replace(/(?<=^|\n)a($|\n)/, "");

  //perfekt - men kompliceret.
  const replaceALine = (str: string) =>
    str.replace(/((?<=^|\n)a\n)|((^|\n)a$)/, "");

  prov.eq("", replaceALine(""));
  prov.eq("", replaceALine("a"));
  prov.eq("b", replaceALine("b"));
  prov.eq("\n", replaceALine("\n"));

  prov.eq("", replaceALine("a\n"));
  prov.eq("aa", replaceALine("aa"));
  prov.eq("ab", replaceALine("ab"));

  prov.eq("ba", replaceALine("ba"));
  prov.eq("", replaceALine("\na"));

  prov.eq("b", replaceALine("a\nb"));
  prov.eq("\n", replaceALine("a\n\n"));
  prov.eq("a", replaceALine("a\na"));

  prov.eq("b", replaceALine("b\na"));
  prov.eq("b\n", replaceALine("b\na\n"));

  //
  // replace one line 2
  //
  // efterlader alle newlines.

  const replaceALine2 = (str: string) => str.replace(/^a$/m, "");

  prov.eq("", replaceALine2(""));
  prov.eq("", replaceALine2("a"));
  prov.eq("b", replaceALine2("b"));
  prov.eq("\n", replaceALine2("\n"));

  prov.eq("\n", replaceALine2("a\n"));
  prov.eq("aa", replaceALine2("aa"));
  prov.eq("ab", replaceALine2("ab"));

  prov.eq("ba", replaceALine2("ba"));
  prov.eq("\n", replaceALine2("\na"));

  prov.eq("\nb", replaceALine2("a\nb"));
  prov.eq("\n\n", replaceALine2("a\n\n"));
  prov.eq("\na", replaceALine2("a\na"));

  prov.eq("b\n", replaceALine2("b\na"));
  prov.eq("b\n\n", replaceALine2("b\na\n"));
};
