export type NodeWSProv<MS extends {}, MR extends {}> = {
  simpleRequest: (data: MS, timeout?: number) => Promise<MR>;
  send: (data: MS) => Promise<void>;
  shutdown: () => Promise<void>;
  noisyKill: () => Promise<void>;
};

/**
 *
 */
export type FinallyProv = {
  finally: FinallyFunc;
  runFinally: () => Promise<void>;
};

export type FinallyFunc = (
  func: () => void | undefined | Promise<void>
) => void;

//
// wpp
//

export type OnRequire = (msg: RequireSenderMessage) => void;

export type RequireSenderMessage = {
  type: "require";
  file: string;
  source?: string;
};
