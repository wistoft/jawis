import { parentPort } from "worker_threads";
import { JagoLogEntry } from "^jagoc";

import { cloneArrayEntries, tos } from "^jab";

import { makeSend } from ".";

//This is only contructed, if there is IPC connection or this is a worker.
// But would be better to detect, if jago actually started this.
let parentSend: (entry: JagoLogEntry) => void;

//only send  if it's possible.

if (process.send || parentPort) {
  parentSend = (entry) => {
    //wasteful to make it each time
    makeSend<JagoLogEntry>()(entry);
  };
}

/**
 *
 */
export const out = (...data: unknown[]) => {
  if (parentSend) {
    parentSend({ type: "log", data: cloneArrayEntries(data) });
  } else {
    console.log(tos(data));
  }
};

/**
 *
 */
export const outHtml = (html: string) => {
  if (parentSend) {
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
