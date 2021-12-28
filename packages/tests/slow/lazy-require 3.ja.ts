import { TestProvision } from "^jarun";

import { makeJacs_lazy } from "../_fixture";

import Adapter from "enzyme-adapter-react-16";

// Use exported default constructor.

export default (prov: TestProvision) => makeJacs_lazy(prov, __filename);

export const main = () => {
  //nothing loaded
  console.log(Object.keys(require.cache).some((elm) => elm.includes("enzyme-adapter-react-16"))); // prettier-ignore

  console.log(typeof Adapter);
  console.log(typeof new Adapter());

  //loaded now
  console.log(Object.keys(require.cache).some((elm) => elm.includes("enzyme-adapter-react-16"))); // prettier-ignore
};
