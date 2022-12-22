import { plugIntoModuleLoadOld } from "..";
import { ppMain } from "./ProcessPreloaderMainUtil";
import { makeRequireSender, makeSend } from ".";

export const wppMain = () => {
  //process preloader

  ppMain();

  //register require last, to avoid noise

  plugIntoModuleLoadOld(makeRequireSender(makeSend()));
};
