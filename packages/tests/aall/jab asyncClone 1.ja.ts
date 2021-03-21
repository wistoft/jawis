import { asyncClone, prej } from "^jab";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => [
  await asyncClone([false, []]),
  await asyncClone(Promise.resolve([true, "hej"])),
  await asyncClone({ err: prej("ups") }),
];
