import { makeBeeOnError } from "^bee-common";
import { makeSend, registerRejectionHandlers, wppMain } from "^jab-node";

//register rejection handlers

registerRejectionHandlers(makeBeeOnError(makeSend()));

//process preloader

wppMain();
