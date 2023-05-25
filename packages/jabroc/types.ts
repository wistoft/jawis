import { MakeBee } from "^bee-common";
import { ScriptOutput } from "^jagoc";
import { ErrorData } from "^jabc";

/**
 *
 */
export type BuzzStoreProv = {
  tryGetOne: () => MakeBee | undefined;
};

/**
 * The interface, that a bee hive channel must support.
 */
export type BuzzChannel = {
  send: (data: BeeFrostServerMessage) => Promise<void>;
};

//
// Bee frost messages
//

export type BeeFrostClientMessage =
  | (ScriptOutput & { bid: number })
  | {
      type: "error"; // error, that can't be attributed to a bee.
      data: ErrorData;
    }
  | {
      type: "exit";
      bid: number;
      data: number | null;
    };

export type BeeFrostServerMessage =
  | {
      type: "setConf"; //must be sent as the first message
      ymerUrl: string;
      scriptsUrl: string;
    }
  | {
      type: "makeBee";
      bid: number;
      fileUrl: string;
    }
  | {
      type: "message";
      bid: number;
      data: {};
    }
  | {
      type: "shutdown";
      bid: number;
    }
  | {
      type: "kill";
      bid: number;
    };
