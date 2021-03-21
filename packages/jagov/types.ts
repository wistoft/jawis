import { ClientMessage, ScriptStatus } from "^jagoc";

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

export type ApiProv = {
  useApiSend: (data: ClientMessage) => () => void;
  apiSend: (data: ClientMessage) => void;
};
