import { TestProvision } from "^jarun";
import { makeMeasure } from "^dev/scripts/util";

//no nested measure

export default (prov: TestProvision) => {
  let time = BigInt(0);

  const { measure, getResult } = makeMeasure(() => time++);

  measure(() => {}, { type: "all", request: "dummy" });

  prov.imp(getResult());
};
