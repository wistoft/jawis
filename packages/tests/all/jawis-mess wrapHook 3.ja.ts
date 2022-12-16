import { renderHook } from "^render-hook";
import { TestProvision } from "^jarun";

//two args

export default (prov: TestProvision) => {
  const { result, hook } = renderHook(
    (x: number, y: number) => x * y,
    1 as number,
    2 as number
  );

  prov.eq(2, result);

  prov.eq(6, hook(2, 3));
};
