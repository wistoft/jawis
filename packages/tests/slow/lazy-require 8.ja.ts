import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import express, * as ns from "express";

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

// Use both default function and ns export. (TypeScript add __importStar, and variable declaration)

export const main = () => {
  //no express
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore

  console.log(typeof express);
  console.log(typeof express());
  console.log(typeof ns.Router);
  console.log(typeof ns.Router());

  //now express is loaded.
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
