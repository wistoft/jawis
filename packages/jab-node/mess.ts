import fs, { PathLike } from "fs";
import sourceMapSupport from "source-map-support";
import { ParsedStackFrame } from "^jab";

/**
 *
 */
export const ensureMkdirSync = (path: PathLike) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

/**
 * Flush stdout and stderr, before exit is called.
 *
 * - Exits after 300ms if streams doesn't end within.
 */
export const flushAndExit = () => {
  let out = false;
  let err = false;

  const tryExit = () => {
    if (out && err) {
      process.exit();
    }
  };

  if (process.stdout.writableLength <= 0) {
    out = true;
  } else {
    process.stdout.end(() => {
      out = true;
      tryExit();
    });
  }

  if (process.stderr.writableLength <= 0) {
    err = true;
  } else {
    process.stderr.end(() => {
      err = true;
      tryExit();
    });
  }

  //if nothing to flush

  tryExit();

  //if stream take to long to flush.

  setTimeout(process.exit, 300);
};

/**
 * - Collect call site information into one string.
 *
 * note
 *  - maybe take from source-map-support#CallSiteToString
 */
export const getFunctionNameFromFrame = (frame: NodeJS.CallSite) => {
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

  return func;
};

/**
 * Extract info from call sites.
 *
 *  - It's still needed to `sourceMapSupport.install`, because this only replaces 'sourceMapSupport.prepareStackTrace'
 *  - Return the conventional stack-string and a 'parsed' stack.
 *  - include non-source-mapped line and file. (useful for opening files in node_modules folder)
 *
 * note
 *  - taken from source-map-support#prepareStackTrace
 *      tried to preserve `curPosition` and `nextPosition`. But don't know what its purpose.
 */
export const extractStackTraceInfo = (
  error: Error,
  stackTraces: NodeJS.CallSite[]
) => {
  const name = error.name || "Error";
  const message = error.message || "";
  const errorString = name + ": " + message;

  const state = { nextPosition: null, curPosition: null };

  const processedStack = [];
  const fullInfo = [];

  for (let i = stackTraces.length - 1; i >= 0; i--) {
    const frame = (sourceMapSupport as any).wrapCallSite(stackTraces[i], state);

    processedStack.push("\n    at " + frame);

    const info: ParsedStackFrame = {
      line: frame.getLineNumber(),
      file: frame.getFileName(),
    };

    //function

    const func = getFunctionNameFromFrame(frame);

    if (func !== null) {
      info.func = func;
    }

    //line

    const line = stackTraces[i].getLineNumber();

    if (info.line !== line && line !== null) {
      info.rawLine = line;
    }

    //file

    const file = stackTraces[i].getFileName();

    if (info.file !== file && file !== null) {
      info.rawFile = file;
    }

    //done

    fullInfo.push(info);

    state.nextPosition = state.curPosition;
  }

  state.curPosition = state.nextPosition = null;

  //return

  const stack = errorString + processedStack.reverse().join("");

  return { stack, fullInfo: fullInfo.reverse() };
};
