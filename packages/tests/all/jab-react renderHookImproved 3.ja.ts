import { renderHookImproved } from "^jawis-mess/node";
import { TestProvision } from "^jarun";

//two args

export default (prov: TestProvision) => {
  const { result, rerender } = renderHookImproved(
    (x: number, y: number) => x * y,
    1 as number,
    2 as number
  );

  prov.eq(2, result);

  prov.eq(6, rerender(2, 3));
};
