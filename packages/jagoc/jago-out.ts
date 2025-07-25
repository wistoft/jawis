import { basename, captureArrayEntries } from "^jab";
import { getGlobalBeeProv } from "^bee-common";
import { ServerMessage, UrlState } from "./internal";

type ServerMessageWithToken = ServerMessage & {
  jago: string;
};

/**
 *
 */
export const out = (...data: unknown[]) => {
  getGlobalBeeProv().sendLog({
    type: "log",
    data: captureArrayEntries(data),
  });
};

/**
 *
 */
export const outHtml = (html: string) => {
  getGlobalBeeProv().sendLog({ type: "html", data: html });
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

/**
 *
 */
export const setStatus = (data: string) => {
  return getGlobalBeeProv().sendLog({ type: "status", data });
};

/**
 *
 */
export const getScriptLink = (filename: string) => {
  const r = eval("require");

  if (!r("path").isAbsolute(filename)) {
    throw new Error("File must be absolute: " + filename);
  }

  if (!r("fs").existsSync(filename)) {
    throw new Error("File must exist: " + filename);
  }

  //quick fix, should urlencode filename. But the view should be changed then.
  const link = r("crypto").createHash("md5").update(filename).digest("hex");

  return link;
};

/**
 *
 */
export const outScriptLink = (filename: string, name?: string) => {
  const link = getScriptLink(filename);

  outLink(name ?? basename(filename), link);
};

/**
 *
 */
export const gotoLocation = (url: string) => {
  getGlobalBeeProv<ServerMessageWithToken>().beeSend({
    jago: "channel-token-goes-here",
    type: "gotoUrl",
    url,
  });
};

/**
 *
 */
export const pushUrlState = <U extends UrlState>(urlState: U) => {
  getGlobalBeeProv<ServerMessageWithToken>().beeSend({
    jago: "channel-token-goes-here",
    type: "pushUrlState",
    urlState,
  });
};

/**
 *
 */
export const replaceUrlState = <U extends UrlState>(urlState: U) => {
  getGlobalBeeProv<ServerMessageWithToken>().beeSend({
    jago: "channel-token-goes-here",
    type: "replaceUrlState",
    urlState,
  });
};

/**
 *
 */
export const getParams = <U extends UrlState>() =>
  getGlobalBeeProv().beeData as U;
