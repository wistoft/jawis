import { TestProvision } from "^jarun";
import { quickFixFilter, toHtml_test } from "../_fixture";

export default ({ imp, filter }: TestProvision) => {
  filter("imp", quickFixFilter);

  imp(toHtml_test(true));
  imp(toHtml_test([true, false]));

  imp(toHtml_test(Promise.resolve()));
};
