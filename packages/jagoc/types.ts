import { BeeLogEntry } from "^bee-common";

//
// script
//

export type ScriptOutput =
  | {
      type: "stdout";
      data: string;
    }
  | {
      type: "stderr";
      data: string;
    }
  | {
      type: "message";
      data: BeeLogEntry;
    };

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
      type: "processStatus";
      data: ScriptStatus[];
    }
  | {
      script: string;
      type: "control";
      data: string;
    }
  | (ScriptOutput & { script: string });
