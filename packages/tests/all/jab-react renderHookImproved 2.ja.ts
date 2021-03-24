import { renderHookImproved } from "^jawis-mess/node";
import { TestProvision } from "^jarun";

//one arg

export default (prov: TestProvision) => {
  const { result, rerender } = renderHookImproved(
    (x: number) => x,
    1 as number
  );

  prov.eq(1, result);

  prov.eq(2, rerender(2));

  // rerender use latest args, when no are supplied

  prov.eq(2, rerender());
};
