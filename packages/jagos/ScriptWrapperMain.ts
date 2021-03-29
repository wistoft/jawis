import {
  makeJagoOnError,
  makeSend,
  registerRejectionHandlers,
  wppMain,
} from "^jab-node";

//register rejection handlers

registerRejectionHandlers(makeJagoOnError(makeSend()));

//process preloader

wppMain();
