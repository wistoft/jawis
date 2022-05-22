import { TestProvision } from "^jarun";
import { quickFixFilter, tos_async, tos_test } from "../_fixture";

export default async ({ imp, filter }: TestProvision) => {
  filter("imp", quickFixFilter);

  imp(tos_test(true));
  imp(tos_test([true, false]));

  imp(tos_test(Promise.resolve("unreach")));

  //async

  imp(await tos_async("hej"));
  imp(await tos_async(Promise.resolve(Infinity)));
};
