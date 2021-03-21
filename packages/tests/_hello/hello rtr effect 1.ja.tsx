import React from "react";

import RTR from "react-test-renderer";
import { TestProvision } from "^jarun";

import { rendererTos } from "^jawis-mess/node";

import { HelloEffect } from "../_fixture";
import { sleeping } from "^jab";

//effects

export default (prov: TestProvision) => {
  const renderer = RTR.create(<HelloEffect />);

  console.log(rendererTos(renderer)); //the mount is executed here.

  renderer.unmount();

  return sleeping(100);
};
