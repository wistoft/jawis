import { TestProvision } from "^jarun";
import { getScriptPath, makeJacs_eager } from "../_fixture";

//hello ts compile

export default (prov: TestProvision) =>
  makeJacs_eager(prov, getScriptPath("helloJab.ts"));
