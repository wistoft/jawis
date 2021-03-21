import { asyncClone, sleepingValue } from "^jab";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) =>
  await asyncClone([Promise.resolve("hej"), sleepingValue(10, true)]);
