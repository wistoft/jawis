import { asyncCapture } from "^async-capture";
import { prej } from "^jab";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => [
  await asyncCapture([false, []]),
  await asyncCapture(Promise.resolve([true, "hej"])),
  await asyncCapture({ err: prej("ups") }),
];
