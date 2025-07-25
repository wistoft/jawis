import { TestProvision } from "^jarun";
import { assert, err, getRandomRange } from "^jab";

export default (prov: TestProvision) => {
  const values = new Set<number>();

  const min = 1;
  const max = 10;

  //check there is the right amount of values.

  for (let i = 0; i < 100; i++) {
    values.add(getRandomRange(min, max));
  }

  if (values.size !== max + 1 - min) {
    err("Doesn't seem to work", values);
  }

  //check values are in range

  for (const val of values) {
    assert(min <= val && val <= max, "Values out of range", values);
  }
};
