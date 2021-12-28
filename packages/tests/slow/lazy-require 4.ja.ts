import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import express from "express";

// Use exported default function (TypeScript adds __importDefault)

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  //no express
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore

  console.log(typeof express);
  console.log(typeof express());

  //now express is loaded.
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
