import { plugIntoModuleLoadOld } from "..";
import { makeRequireSender, makeSend } from ".";

import { ppMain } from "./ProcessPreloaderMainUtil";

export const wppMain = () => {
  //process preloader

  ppMain();

  //register require last, to avoid noise

  plugIntoModuleLoadOld(makeRequireSender(makeSend()));
};
