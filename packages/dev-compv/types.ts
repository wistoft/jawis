import React from "react";

import { WsStates } from "^react-use-ws";

import { ClientMessage } from "./internal";

export type ApiProv = {
  apiSend: (data: ClientMessage) => void;
  wsState: WsStates;
};

//
// state
//

export type State = {};

//
// callbacks/hooks
//

export type StateCallbacks = {};

//
// more
//

export type ComponentDef = {
  name: string;
  path: string;
  urlSafePath: string;
  comp: React.ComponentType<unknown> | (() => void);
};
