import { tos } from "^jab";
import { TestProvision } from "^jarun";

export default ({ eq }: TestProvision) => {
  eq("{}", tos({}));
  eq(" ", tos(" "));

  eq(" ", tos(" "));

  eq("ArrayBuffer: 10", tos(new ArrayBuffer(10)));
  eq("SharedArrayBuffer: 10", tos(new SharedArrayBuffer(10)));
  eq("DataView: 10", tos(new DataView(new ArrayBuffer(10))));
};
