import jsStringEscape from "js-string-escape";

import { tryHandleTunneledLog } from "^bee-common";
import {
  LogEntry,
  assertNever,
  def,
  err,
  getRandomInteger,
  tryProp,
  unknownToErrorData,
} from "^jab";

import { BeeFrostClientMessage, BeeFrostServerMessage } from "./internal";

export type JabroHiveDeps = {
  apiSend: (data: BeeFrostClientMessage) => void;
};

/**
 *
 * - Make every effort to get errors and logging back to the server.
 */
export class JabroHive {
  private workers: Map<number, Worker> = new Map();

  private channelToken;
  private ymerUrl?: string;
  private webCsUrl?: string;

  constructor(private deps: JabroHiveDeps) {
    this.channelToken = "" + getRandomInteger();
  }

  /**
   *
   */
  public onError = (error: unknown) => {
    this.deps.apiSend({
      type: "error",
      data: unknownToErrorData(error),
    });
  };

  /**
   *
   */
  public onServerMessage = (msg: BeeFrostServerMessage) => {
    try {
      this.onServerMessageReal(msg);
    } catch (error) {
      this.onError(error);
    }
  };

  /**
   *
   */
  private onServerMessageReal = (msg: BeeFrostServerMessage) => {
    switch (msg.type) {
      case "setConf": {
        //this may be sent again: when ws reconnects.
        this.ymerUrl = msg.ymerUrl;
        this.webCsUrl = msg.webCsUrl;
        break;
      }

      case "makeBee": {
        this.make(msg.bid, msg.filename, def(this.ymerUrl));
        break;
      }

      case "message": {
        const worker = this.workers.get(msg.bid);

        if (worker === undefined) {
          throw err("JabroHive.onMessage: Unknown bee: ", msg.bid);
        }

        worker.postMessage(msg.data);
        break;
      }

      case "shutdown": {
        const worker = this.workers.get(msg.bid);

        if (worker === undefined) {
          throw err("JabroHive.Shutdown: Unknown bee: ", msg.bid);
        }

        worker?.postMessage({ type: "shutdown" });
        break;
      }

      case "kill": {
        this.killBee(msg.bid);
        break;
      }

      default:
        assertNever(msg, "Unknown message");
    }
  };

  /**
   *
   */
  private killBee = (bid: number) => {
    const worker = this.workers.get(bid);

    if (worker === undefined) {
      throw err("JabroHive.Shutdown: Unknown bee: ", bid);
    }

    this.workers.delete(bid);

    worker.terminate();

    this.deps.apiSend({
      type: "exit",
      bid,
    });
  };

  /**
   * A heroic attempt to compensate for inconvenient web workers.
   */
  private make = (bid: number, filename: string, ymerUrl: string) => {
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
        
    function panicError(error, info = []){
      postMessage({
        beeLog: ${this.channelToken},
        type: "error",
        data: {
          msg: error.message,
          info: info,
          stack: {
            type: "other",
            stack: error.stack
          }
        }
      });
    };

    function importScriptsQuickFix(url) {
      //import script, that knows of the quick fix

        delete QUICK_FIX;
        importScripts(url);

      //check if errors happened.

        if (typeof QUICK_FIX !== "undefined") {

          //stuff

            let reported = false
            var e = QUICK_FIX;
            delete QUICK_FIX;
            
          //try to report to ymer
          
            if (self.onError){
              try{
                self.onError(e);
                reported = true
              }catch(error) {
                panicError(error, ["Error in ymer"])
              }
            }
            
          //output error from server
            
            if (!reported){
              panicError(e, ["JabroHive: nowhere to report errors"])
            }
            
          //send the error, because throwing means we loose the stack trace.
            
            panicError(new Error("Could not require: " + url))

          //stop further execution

            close(); //empties the event-loop. Might be to aggressive

          //ask main to kill, because we can't do it from within the worker

            throw new Error("noMoreWork${this.channelToken}");

        }
    }

    
    //todo url encode filename
    function jabroRequire(filename){
      return jabroRequireUrl("${jsStringEscape(this.webCsUrl)}" + filename);
    }

    function jabroRequireUrl(url){
      delete QUICK_FIX_EXPORT;

      importScriptsQuickFix(url);

      if (typeof QUICK_FIX_EXPORT !== "undefined") {
        return QUICK_FIX_EXPORT
      } else {
        return {}
      }
    }

    //ahhh

    const { startBee } = jabroRequireUrl("${jsStringEscape(ymerUrl)}");

    startBee(jabroRequire, ${this.channelToken}, "${jsStringEscape(filename)}");
    `;

    const url = URL.createObjectURL(
      new Blob([code], {
        type: "text/javascript",
      })
    );

    const onLog = (data: LogEntry) =>
      this.deps.apiSend({
        type: "log",
        bid,
        data,
      });

    const debugLog = (data: string) =>
      onLog({
        type: "stream",
        logName: "jabrov",
        data,
      });

    const worker = new Worker(url);

    this.workers.set(bid, worker);

    //leave this out to be able to debug. maybe remove, when script is done instead.
    // URL.revokeObjectURL(url);

    worker.onmessage = (msg: MessageEvent) => {
      if (tryHandleTunneledLog(msg.data, onLog, this.channelToken)) {
        return;
      }

      //for some reason is the type wrong here, so loose comparison
      if (tryProp(msg.data, "noMoreWork") == this.channelToken) {
        this.killBee(bid);
      } else {
        //the message belongs to the user.

        this.deps.apiSend({
          type: "message",
          bid,
          data: msg.data,
        });
      }
    };

    //ymer can always prevent this.
    worker.addEventListener("unhandledrejection", () => {
      debugLog("outer unhandledrejection");
    });

    //we get very poor error data here. But ymer catches the errors it can, so the rest
    //  that comes here is probably just syntax errors.
    worker.addEventListener("error", (event) => {
      event.preventDefault(); //needed so the error doesn't continue to window.onerror

      //check if kill is requested.

      if (event.message.includes("noMoreWork" + this.channelToken)) {
        this.killBee(bid);
        return;
      }

      //ordinary error

      if (event.error !== null && event.error !== undefined) {
        //You see, there isn't anything useful in the listener, when this never prints.
        debugLog("error had data in beehive: " + JSON.stringify(event.error));
      }

      //report the little information we're given.

      let stack = [{ file: event.filename, line: event.lineno }];

      if (!event.filename && !event.filename) {
        //this happens for security errors
        stack = [];
      }

      onLog({
        type: "error",
        data: {
          msg: event.message || "unknown error message",
          info: [],
          stack: {
            type: "parsed",
            stack,
          },
        },
      });
    });
  };
}
