import { TestProvision } from "^jarun";
import { toAtomizedString_async, toAtomizedString_test } from "../_fixture";

export default async ({ imp }: TestProvision) => {
  imp(toAtomizedString_test(true));
  imp(toAtomizedString_test([true, false]));

  imp(toAtomizedString_test(Promise.resolve("unreach")).replace("JarunPromise : ", "")); // prettier-ignore

  //async

  imp(await toAtomizedString_async("hej"));
  imp(await toAtomizedString_async(Promise.resolve(Infinity)));
};
