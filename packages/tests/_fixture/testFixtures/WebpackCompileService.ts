import { OnError } from "^jab";

declare const global: any;

export const evalWebpackOutput = (code: string, onError: OnError) => {
  //quick fix - to avoid reference error

  global.QUICK_FIX_EXPORT = undefined;

  //eval script, that knows of the quick fix

  delete global.QUICK_FIX;
  eval(code);

  //check if errors happened.

  if (typeof global.QUICK_FIX !== "undefined") {
    //stuff

    const e = global.QUICK_FIX;
    delete global.QUICK_FIX;

    onError(e);
  }
};
