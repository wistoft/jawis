import { TestProvision } from "^jarun";
import { splitSurroundingWhitespace } from "^jab";

export default ({ eq }: TestProvision) => {
  eq(["", "", ""], splitSurroundingWhitespace(""));
  eq([" ", "", ""], splitSurroundingWhitespace(" "));
  eq(["\n", "", ""], splitSurroundingWhitespace("\n"));
  eq(["\n \t", "", ""], splitSurroundingWhitespace("\n \t"));

  eq(["", "hejsa", ""], splitSurroundingWhitespace("hejsa"));
  eq(["", "he\nsa", ""], splitSurroundingWhitespace("he\nsa"));
  eq(["", "he \n sa", ""], splitSurroundingWhitespace("he \n sa"));

  eq(["", "hejsa", "\n\n"], splitSurroundingWhitespace("hejsa\n\n"));

  eq(["\n", "hejsa", ""], splitSurroundingWhitespace("\nhejsa"));
  eq([" \n", "hejsa", ""], splitSurroundingWhitespace(" \nhejsa"));

  eq(
    [" \t\t", "hejsa", "\t \n"],
    splitSurroundingWhitespace(" \t\thejsa\t \n")
  );
};
