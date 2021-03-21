import { renderHookImproved } from "^jawis-mess/node";
import { TestProvision } from "^jarun";

//no args

export default (prov: TestProvision) => {
  const { result } = renderHookImproved(() => 1);

  prov.eq(1, result);
};
