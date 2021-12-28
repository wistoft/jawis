import { TestProvision } from "^jarun";
import { getScriptPath, makeJacs_eager } from "../_fixture";

// Eager is default, when lazy is disabled

export default (prov: TestProvision) =>
  makeJacs_eager(prov, getScriptPath("helloRequire"));
