import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import React from "react";

// Use exported default object. (TypeScript adds __importDefault)

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  //no react
  console.log(Object.keys(require.cache).some((elm) => elm.includes("react"))); // prettier-ignore

  //use something in react.
  console.log(React.createElement("a", {}));

  //now react is loaded.
  console.log(Object.keys(require.cache).some((elm) => elm.includes("react"))); // prettier-ignore
};
