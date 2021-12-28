import { MakeBee, ScriptOutput, NodeWSProv } from "^jabc";

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

/**
 * A bee store, where the channel is a web socket.
 */
export type WsBuzzStore = BuzzStoreProv & {
  register: <MR extends {}>(
    nws: NodeWSProv<
      {
        type: "beeFrost";
        data: BeeFrostServerMessage;
      },
      MR
    >
  ) => void;
  onMessage: <MR extends {}>(
    nws: NodeWSProv<
      {
        type: "beeFrost";
        data: BeeFrostServerMessage;
      },
      MR
    >,
    msg: BeeFrostClientMessage
  ) => void;
};

//
// Bee frost messages
//

export type BeeFrostClientMessage =
  | (ScriptOutput & { fileUrl: string })
  | {
      type: "exit";
      fileUrl: string;
      data: number | null;
    };

export type BeeFrostServerMessage =
  | {
      type: "makeBee";
      fileUrl: string;
      ymerUrl: string; //quick fix - could be generalized away.
    }
  | {
      type: "message";
      fileUrl: string;
      data: {};
    }
  | {
      type: "shutdown";
      fileUrl: string;
    }
  | {
      type: "kill";
      fileUrl: string;
    };
