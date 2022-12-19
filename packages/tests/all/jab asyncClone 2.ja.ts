import { asyncCapture } from "^async-capture";
import { TestProvision } from "^jarun";
import { sleepingValue } from "^yapu";

export default async (prov: TestProvision) =>
  await asyncCapture([Promise.resolve("hej"), sleepingValue(10, true)]);
