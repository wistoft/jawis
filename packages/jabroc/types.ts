import { MakeBee, BeeOutput } from "^bee-common";
import { AbsoluteFile, ErrorData } from "^jabc";

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
  send: (data: BeeFrostServerMessage) => void;
};

//
// Bee frost messages
//

export type BeeFrostClientMessage =
  | (BeeOutput & { bid: number })
  | {
      type: "error"; // error, that can't be attributed to a bee.
      data: ErrorData;
    }
  | {
      type: "exit";
      bid: number;
    };

export type BeeFrostServerMessage =
  | {
      type: "setConf"; //must be sent as the first message
      ymerUrl: string;
      webCsUrl: string;
    }
  | {
      type: "makeBee";
      bid: number;
      filename: AbsoluteFile;
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
