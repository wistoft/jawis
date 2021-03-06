import { TestProvision } from "^jarun";

import { useUnmountSafeFunction } from "^jab-react";
import { wrapHook } from "^misc/node";

export default ({ eq, chk }: TestProvision) => {
  const innerFunc = (x: string) => x;
  // eslint-disable-next-line unused-imports/no-unused-vars-ts
  const innerFunc2 = (x: string) => "new";

  const { result, unmount, hook, rerender } = wrapHook(
    useUnmountSafeFunction,
    innerFunc
  );

  const safedFunc = result;

  eq("hej", result("hej"));

  // is referentially stable

  const res1 = rerender();

  chk(safedFunc === res1);

  // make new function, when input changes

  const res2 = hook(innerFunc2);

  eq("new", res2("hej"));
  chk(safedFunc !== res2);

  // doesn't run the function, after unmount is called.

  unmount();

  eq(undefined, res1("hej"));
  eq(undefined, res2("hej"));
};
