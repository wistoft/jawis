import async_hooks from "async_hooks";
import { makeJagoSend, makeSend, enable } from "^jab";
import { makeJagoOnError, registerErrorHandlers, wppMain } from "^jab-node";

//register rejection handlers

registerErrorHandlers(makeJagoOnError(makeJagoSend(makeSend())));

//long traces

enable(async_hooks);

//process preloader

wppMain();
