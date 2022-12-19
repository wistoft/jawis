import { asyncCapture } from "^async-capture";
import { TestProvision } from "^jarun";

export default (prov: TestProvision) =>
  asyncCapture([new Promise(() => {})], 10, () => {});
