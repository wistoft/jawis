import { MainProv, flushAndExit } from "^jab-node";
import { MakeBee } from "^bee-common";
import { assertNever, tos } from "^jab";
import {
  ServerMessage,
  experimentalDirector as experimentalJatesDirector,
} from "^jates";

import {
  getJaviConf,
  makeJarunTestRunners,
  makeTsNodeJabProcess,
} from "./internal";

type Deps = {
  makeTsBee: MakeBee;
  mainProv: MainProv;
};

/**
 * Run tests in CLI
 *
 */
export const startJaviTest = (deps: Deps) => {
  //conf

  const conf = getJaviConf(process.cwd());

  //make director

  const director = experimentalJatesDirector({
    createTestRunners: makeJarunTestRunners,
    makeTsProcess: makeTsNodeJabProcess,
    absTestFolder: conf.absTestFolder,
    absTestLogFolder: conf.absTestLogFolder,
    tecTimeout: conf.tecTimeout,
    compareFiles: () => {
      throw new Error("Impossible");
    },
    handleOpenFileInEditor: () => {
      throw new Error("Impossible");
    },
    ...deps,
    ...deps.mainProv,
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
          //we are only guaranteed to have received all messages, after jates jave shutdown
          deps.mainProv.finalProv.runFinally().finally(() => {
            console.log("");

            if (failCount) {
              failedNames.forEach((test) => console.log(test));
              console.log(failCount + " tests failed");
              failReports.forEach((report) => console.log(tos(report)));
            } else {
              console.log("All tests pass");
            }

            //needed because jacs doesn't have a kill method.
            flushAndExit(failCount === 0 ? 0 : 1);
          });
        }
        break;

      case "TestSelection":
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
  // director.onClientMessage({ type: "runCurrentSelection" }, undefined as any);
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
