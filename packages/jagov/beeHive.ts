import jsStringEscape from "js-string-escape";

import { assertNever, err, JagoLogEntry, tryProp } from "^jab";
import { BeeFrostClientMessage, BeeFrostServerMessage } from "^jabroc";

//quick fix

const workers: Map<string, Worker> = new Map();

type Deps = {
  apiSend: (data: { type: "beeFrost"; data: BeeFrostClientMessage }) => void;
};

/**
 * todo
 *  implement graceful shutdown
 */
export const handleBeeFrostMessage = (
  msg: BeeFrostServerMessage,
  deps: Deps
) => {
  switch (msg.type) {
    case "makeBee": {
      if (workers.has(msg.fileUrl)) {
        err("Bee with this name already exists.", msg.fileUrl);
      }

      const worker = make(msg.fileUrl, msg.ymerUrl, deps);

      workers.set(msg.fileUrl, worker);
      break;
    }

    case "message":
      console.log("not impl:" + msg.type);
      break;

    case "shutdown": {
      const worker = workers.get(msg.fileUrl);

      worker?.postMessage({ type: "shutdown" });
      break;
    }

    case "kill": {
      killBee(msg.fileUrl, deps);
      break;
    }

    default:
      assertNever(msg, "Unknown message");
  }
};

const killBee = (fileUrl: string, deps: Deps) => {
  const worker = workers.get(fileUrl);

  if (worker === undefined) {
    throw err("Unknown bee", fileUrl);
  }

  workers.delete(fileUrl);

  worker.terminate();

  deps.apiSend({
    type: "beeFrost",
    data: {
      type: "exit",
      fileUrl: fileUrl,
      data: 0,
    },
  });
};
/**
 *
 */
const make = (fileUrl: string, ymerUrl: string, deps: Deps) => {
  //problem 1
  //  sync errors are for some reason squashed into an useless NetworkError
  //    we can simply use global scope to store and get the error.
  //    this is not placed in ymer.ts, because we also wish to get errors from there in development.
  //    async errors aren't squashed for some reason.
  //problem 2
  //  syntax errors are made into useless 'Script error.'
  //    therefore we try to report it to ymer otherwise just print.
  //extra
  //    we also need to guard against ymer throwing.
  const code = `
    function saveImportScripts(url) {
      // stop if errors has occurred

        if (self.stopping){ return;}

      //import script, that knows of the quick fix

        delete QUICK_FIX; //just to be safe
        importScripts(url);

      //check if errors happened.

        if (typeof QUICK_FIX !== "undefined") {

          //stuff

            self.stopping = true;
            var e = QUICK_FIX;
            delete QUICK_FIX;

          //try to report to ymer
          
            if (self.onError){
              try{
                self.onError(e)
                return;
              }catch(error) {
                //error in ymer
                console.log(error.message);
                console.log(error.stack);
              }
            }

          //panik

            console.log(e.message);
            e.stack && console.log(e.stack);
        }
    }

    saveImportScripts("${jsStringEscape(ymerUrl)}");
    saveImportScripts("${jsStringEscape(fileUrl)}");
    `;

  const url = window.URL.createObjectURL(
    new Blob([code], {
      type: "text/javascript",
    })
  );

  const worker = new Worker(url);

  //leave this out to be able to debug. maybe remove, when script is done instead.
  URL.revokeObjectURL(url);

  worker.onmessage = (msg: MessageEvent) => {
    if (tryProp(msg.data, "channel") === "jago_channel_token") {
      //first custom control messages

      if (tryProp(msg.data, "type") === "NO_MORE_WORK") {
        killBee(fileUrl, deps);
        return;
      }

      //Then it must be a jago log, so send it to controller.

      delete (msg.data as any)["channel"];

      deps.apiSend({
        type: "beeFrost",
        data: {
          type: "log",
          fileUrl,
          data: msg.data as JagoLogEntry,
        },
      });
    } else {
      //normal ipc message from script

      deps.apiSend({
        type: "beeFrost",
        data: {
          type: "message",
          fileUrl,
          data: msg.data,
        },
      });
    }
  };

  //ymer can always prevent this.
  worker.addEventListener("unhandledrejection", () => {
    console.log("outer unhandledrejection");
  });

  //we get very poor error data here. But ymer catches the errors it can, so the rest
  //  that comes here is probably just syntax errors.
  worker.addEventListener("error", (event) => {
    event.preventDefault(); //needed so the error doesn't continue to window.onerror

    if (event.error !== null && event.error !== undefined) {
      //You see, there isn't anything usefull in the listener, when this never prints.
      console.log("error had data in beehive", event.error);
    }

    //report the little information we're given.

    let stack = [{ file: event.filename, line: event.lineno }];

    if (!event.filename && !event.filename) {
      //this happens for security errors
      stack = [];
    }

    deps.apiSend({
      type: "beeFrost",
      data: {
        type: "log",
        fileUrl,
        data: {
          type: "error",
          data: {
            msg: event.message || "unknown error message",
            info: ["outer"],
            stack: {
              type: "node-parsed",
              stack,
            },
          },
        },
      },
    });
  });

  return worker;
};
