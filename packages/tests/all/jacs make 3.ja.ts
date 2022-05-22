import { TestProvision } from "^jarun";
import { getTsProjectPath, makeJacs_lazy } from "../_fixture";

//ts paths are correctly handled

export default (prov: TestProvision) =>
  makeJacs_lazy(prov, getTsProjectPath("hello2.ts"));
