import { TestProvision } from "^jarun";
import { getRandomString, splitSurroundingWhitespace } from "^jab";

export default ({ eq }: TestProvision) => {
  for (let i = 0; i < 10000; i++) {
    const pre = getRandomString([" ", "\n", "\t"]);
    const middle = "a" + getRandomString([" ", "\n", "\t", "a"]) + "a";
    const post = getRandomString([" ", "\n", "\t"]);

    const [pre_, middle_, post_] = splitSurroundingWhitespace(
      pre + middle + post
    );

    eq(pre, pre_);
    eq(middle, middle_);
    eq(post, post_);
  }
};
