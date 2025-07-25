import { TestProvision } from "^jarun";
import { makeMeasure } from "^dev/scripts/util";

//work throws, but measure still gives result

export default (prov: TestProvision) => {
  let time = BigInt(0);

  const { measure, getResult } = makeMeasure(() => time++);

  prov.catch(() => {
    measure(
      () => {
        throw new Error("ups");
      },
      { type: "all", request: "dummy" }
    );
  });

  prov.imp(getResult());
};
