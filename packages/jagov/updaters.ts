import { ScriptStatus, State } from "./internal";

/**
 *
 */
export const setProcessStatusUpdater =
  (deps: { processStatus: ScriptStatus[] }) => (): Partial<State> => ({
    processStatus: deps.processStatus,
  });
