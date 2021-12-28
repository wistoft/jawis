import { ScriptOutput } from "^jabc";
import { BeeFrostClientMessage, BeeFrostServerMessage } from "^jabroc";

//
// script
//

export type ScriptStatusTypes =
  | "preloading"
  | "running"
  | "listening"
  | "stopped";

export type ScriptStatus = {
  id: string;
  script: string;
  status: ScriptStatusTypes;
};

//
// websocket - client messasge
//

export type ClientMessage =
  | {
      type: "startListen";
    }
  | {
      type: "restartAll";
    }
  | {
      type: "stopAll";
    }
  | {
      type: "restartScript";
      script: string;
    }
  | {
      type: "stopScript";
      script: string;
    }
  | {
      type: "openFile";
      file: string;
      line?: number;
    }
  | {
      type: "openRelFile"; //relative to projectRoot
      file: string;
      line?: number;
    }
  | {
      type: "beeFrost";
      data: BeeFrostClientMessage;
    };

//
// websocket - server messasge
//

/**
 *
 * properties
 *
 *  id      opaque for the client. It's used for creating url routes. (maybe just to avoid do md5 in the browser.) //udgår.
 *  script  is the absolute path of the script.
 */
export type ServerMessage =
  | {
      type: "beeFrost";
      data: BeeFrostServerMessage;
    }
  | {
      type: "processStatus";
      data: ScriptStatus[];
    }
  | {
      script: string;
      type: "control";
      data: string;
    }
  | (ScriptOutput & { script: string });
