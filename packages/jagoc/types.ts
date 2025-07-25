import { AbsoluteFile, LogEntry } from "^jab";

//
// script
//

export type ScriptStatusTypes =
  | "preloading"
  | "running"
  | "listening"
  | "stopped";

//id: opaque for the client. It's used for creating url routes. Udgår.
export type ScriptStatus = {
  id: string;
  script: string;
  status: ScriptStatusTypes;
  time?: number; //seconds floating point
};

export type ScriptDefinition = {
  script: AbsoluteFile;
  autoStart?: boolean;
  autoRestart?: boolean;
  shutdownTimeout?: number;
};

//
// websocket - client message
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
      data: Record<string, any>;
    }
  | {
      type: "stopScript";
      script: string;
    }
  | {
      type: "killScript";
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
// websocket - server message
//

/**
 *  script is the absolute path of the script.
 */
export type ServerMessage =
  | {
      type: "processStatus";
      data: ScriptStatus[];
    }
  | {
      type: "gotoUrl";
      url: string;
    }
  | {
      type: "pushUrlState";
      urlState: UrlState;
    }
  | {
      type: "replaceUrlState";
      urlState: UrlState;
    }
  | ({ script: string } & LogEntry);

export type UrlState = { [_: string | number]: string };
