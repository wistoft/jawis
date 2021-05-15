import { TestProvision } from "^jarun";
import { makeMeasure } from "^misc";

//no nested measure

export default (prov: TestProvision) => {
  let time = BigInt(0);

  const { measure, getResult } = makeMeasure(() => time++);

  measure(() => {}, { type: "all", request: "dummy" });

  prov.imp(getResult());
};
