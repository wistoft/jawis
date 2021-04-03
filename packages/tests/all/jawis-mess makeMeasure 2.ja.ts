import { TestProvision } from "^jarun";
import { makeMeasure } from "^jawis-mess";

//nested measure

export default (prov: TestProvision) => {
  let time = BigInt(0);

  const { measure, getResult } = makeMeasure(() => time++);

  measure(
    () => {
      measure(() => {}, { type: "resolve", request: "dummy" });
    },
    { type: "all", request: "dummy" }
  );

  prov.imp(getResult());
};
