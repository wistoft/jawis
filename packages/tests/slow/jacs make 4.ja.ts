import { TestProvision } from "^jarun";
import { getScriptPath, makeJacs_lazy } from "../_fixture";

//parsed and source-mapped stack is added to errors.

export default (prov: TestProvision) =>
  makeJacs_lazy(prov, getScriptPath("jacs_make.ts"));
