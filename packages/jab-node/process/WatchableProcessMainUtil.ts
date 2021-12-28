import { interceptResolve } from "..";
import { makeMakeRequireSender } from ".";

import { ppMain } from "./ProcessPreloaderMainUtil";
import { makeSend } from "^jab";

export const wppMain = () => {
  //process preloader

  ppMain();

  //register require last, to avoid noise

  interceptResolve(makeMakeRequireSender(makeSend()));
};
