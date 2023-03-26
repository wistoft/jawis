import { ClientMessage, ScriptStatus } from "./internal";

export type ApiProv = {
  useApiSend: (data: ClientMessage) => () => void;
  apiSend: (data: ClientMessage) => void;
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
