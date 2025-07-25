import { asyncFlushAndExit } from "^jab-node";
import { assert, assertNever, tos } from "^jab";
import { experimentalDirector, ServerMessage } from "^jates";

import {
  JaviService,
  JaviServiceNew,
  makeMakeTestFrameworks,
} from "./internal";

type Deps = {
  javiService: JaviService;
};

/**
 * Run tests in CLI
 *
 */
export const startJaviTest = async (deps: Deps) => {
  const jnew = deps.javiService as JaviServiceNew;

  //gets deps

  const makeTestFrameworks = await makeMakeTestFrameworks(deps.javiService);
  const mainProv = await jnew.getService("@jawis/javi/mainProv"); // prettier-ignore
  const tecTimeout = deps.javiService.getRootConfig<number>("@jawis/jates/tecTimeout"); // prettier-ignore

  //make director

  const director = experimentalDirector({
    tecTimeout,
    makeTestFrameworks,
    externalBeeLogSource: {
      getBufferedLogEntries: () => {
        return [];
      },
    },
    compareFiles: () => {
      throw new Error("Impossible");
    },
    handleOpenFileInEditor: () => {
      throw new Error("Impossible");
    },
    ...mainProv,
  });

  let count = 0;
  let failCount = 0;

  const failedNames: string[] = [];
  const failReports: any[] = [];

  const socket = new DummyWebSocket((json: any) => {
    const msg = JSON.parse(json) as ServerMessage;

    switch (msg.type) {
      case "IsRunning":
        if (msg.data === false) {
          //we are only guaranteed to have received all messages, after jates have shutdown

          mainProv.finalProv.runFinally().finally(() => {
            console.log("");

            if (failCount) {
              failedNames.forEach((test) => console.log(test));
              console.log(failCount + " tests failed");
              failReports.forEach((report) => console.log(tos(report)));
            } else {
              console.log("All tests pass");
            }

            //needed because jacs doesn't have a kill method.
            asyncFlushAndExit(failCount === 0 ? 0 : 1);
          });
        }
        break;

      case "TestSelection":
        assert(msg.data.length === 1);
        console.log("Tests to execute: " + msg.data[0].length);
        break;

      case "TestCaseStarts":
        break;

      case "TestReport":
        count++;

        if (msg.data.status !== ".") {
          failCount++;
          failedNames.push(msg.data.id);
          failReports.push(msg.data);
        }

        process.stdout.write("" + msg.data.status);

        if (count % 10 === 0) {
          if (count % 100 === 0) {
            console.log();
          } else {
            process.stdout.write(" ");
          }
        }
        //todo store full result
        break;

      case "OnRogue":
        console.log("Rogue:", msg.data);
        //todo store full result
        break;

      default:
        assertNever(msg, "Unknown server message");
    }
  });

  //start

  director.onWsUpgrade(socket as any, undefined as any, undefined as any);
  director.onClientMessage({ type: "runAllTests" }, undefined as any);
};

//quick fix
const WebSocket_OPEN = 1;
const WebSocket_CLOSED = 3;

/**
 *
 */
class DummyWebSocket {
  public readyState: any = WebSocket_OPEN;
  public listeners: any = { open: [], message: [], close: [], error: [] };
  public closed = false;

  constructor(private onMessage: any) {}

  public on = (type: string, listener: any) => {
    this.listeners[type].push(listener);
  };

  public send = (msg: any) => {
    this.onMessage(msg);
  };

  public close = () => {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.readyState = WebSocket_CLOSED;
    this.listeners.close.forEach((listener: any) => listener());
  };

  public terminate = () => {
    this.close();
  };
}
