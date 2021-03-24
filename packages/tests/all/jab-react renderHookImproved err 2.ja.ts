import { renderHookImproved } from "^jawis-mess/node";
import { TestProvision } from "^jarun";

//throws in rerender

export default (prov: TestProvision) => {
  let first = true;
  const { result, rerender } = renderHookImproved(() => {
    if (first) {
      first = false;
      return 1;
    } else {
      throw new Error("ups");
    }
  });

  prov.eq(1, result);

  rerender();
};
