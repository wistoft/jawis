import NodeStackTrace from "stack-trace";

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

/**
 *
 */
export const parseNodeTrace = (stack: string) => {
  //note parse can't be called alone, it must have 'this === NodeStackTrace'
  const trace = NodeStackTrace.parse({ stack } as any);

  return trace.map((frame) => {
    // compose

    let composedFunc;

    if (frame.getTypeName() !== null) {
      if (frame.getMethodName() !== null) {
        composedFunc = frame.getTypeName() + "." + frame.getMethodName();
      } else {
        composedFunc = frame.getTypeName() + ".<anonymous>";
      }
    } else {
      if (frame.getMethodName() !== null) {
        composedFunc = frame.getMethodName();
      } else {
        composedFunc = "";
      }
    }

    //check

    let func = frame.getFunctionName();

    if (func === null) {
      func = composedFunc;
    }

    //return

    return {
      line: frame.getLineNumber(),
      file: frame.getFileName(),
      func,
    };
  });
};
