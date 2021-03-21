import { TestProvision } from "^jarun";
import { toHtml_test } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(toHtml_test(true));
  imp(toHtml_test([true, false]));

  imp(toHtml_test(Promise.resolve()));
};
