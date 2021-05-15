import { assert } from "^jab";

/**
 *
 */
export const getApiPath = (port: number | undefined, path: string) => {
  assert(!path.startsWith("/"), "Path must not start with /");

  if (port) {
    return location.hostname + ":" + port + "/" + path;
  } else {
    return location.host + "/" + path;
  }
};
