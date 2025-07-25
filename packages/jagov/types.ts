import { WsStates } from "^react-use-ws";

import { ClientMessage, ScriptStatus } from "./internal";

export type ApiProv = {
  apiSend: (data: ClientMessage) => void;
  wsState: WsStates;
};

//
// state
//

export type State = {
  processStatus?: ScriptStatus[];
};

//
// callbacks/hooks
//

export type StateCallbacks = {
  setProcessStatus: (deps: { processStatus: ScriptStatus[] }) => void;
};
