import { parentPort } from "worker_threads";
import {
  JagoLogEntry,
  makeJagoSend,
  makeSend,
  cloneArrayEntries,
  tos,
} from "^jab";

const canSend = process.send || parentPort;

//This is only contructed, if there is IPC connection or this is a worker.
// But would be better to detect, if jago actually started this.
let sendFunction: (entry: JagoLogEntry) => void;

/**
 *
 */
const parentSend = (msg: any) => {
  if (!sendFunction) {
    sendFunction = makeJagoSend(makeSend());
  }

  sendFunction(msg);
};

/**
 *
 */
export const out = (...data: unknown[]) => {
  if (canSend) {
    parentSend({
      type: "log",
      data: cloneArrayEntries(data),
    });
  } else {
    console.log(tos(data));
  }
};

/**
 *
 */
export const outHtml = (html: string) => {
  if (canSend) {
    parentSend({ type: "html", data: html });
  } else {
    console.log("Html not displayed in console.");
  }
};

/**
 * todo: encode
 */
export const outLink = (name: string, href: string) => {
  outHtml(`<a href="${href}">${name}</a>`);
};

/**
 * todo: encode
 */
export const outImg = (src: string) => {
  outHtml(`<img src="${src}" />`);
};
