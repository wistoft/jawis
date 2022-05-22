import { TestProvision } from "^jarun";
import { getSharedDynamicMap } from "^tests/_fixture";

//too little key size in inner map.

export default (prov: TestProvision) => {
  getSharedDynamicMap(prov, {
    KEY_SIZE: 4,
  });
};
