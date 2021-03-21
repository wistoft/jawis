import { renderHookImproved } from "^jawis-mess/node";
import { TestProvision } from "^jarun";

//throws in first render

export default (prov: TestProvision) => {
  renderHookImproved(() => {
    throw new Error("ups");
  });
};
