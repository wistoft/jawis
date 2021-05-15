import { wrapHook } from "^misc/node";
import { TestProvision } from "^jarun";

//one arg

export default (prov: TestProvision) => {
  const { result, hook, rerender } = wrapHook((x: number) => x, 1 as number);

  prov.eq(1, result);

  prov.eq(2, hook(2));

  // rerender use latest args.

  prov.eq(2, rerender());
};
