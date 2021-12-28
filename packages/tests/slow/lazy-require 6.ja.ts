import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import express, { Router } from "express";

// Use both default function and 'member' exports. (TypeScript add __importStar)

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  //no express
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore

  console.log(typeof express);
  console.log(typeof express());
  console.log(typeof Router);
  console.log(typeof Router());

  //now express is loaded.
  console.log(Object.keys(require.cache).some((elm) => elm.includes("express"))); // prettier-ignore
};
