import { TestProvision } from "^jarun";
import { err, getRandomInteger } from "^jab";

export default (prov: TestProvision) => {
  const values = new Set();

  const max = 10;

  for (let i = 0; i < 100; i++) {
    values.add(getRandomInteger(max));
  }

  if (values.size !== max + 1) {
    err("Doesn't seem to work", values);
  }
};
