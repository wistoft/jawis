import { ScriptStatus } from "^jagoc";
import { State } from ".";

/**
 *
 */
export const setProcessStatusUpdater =
  (deps: { processStatus: ScriptStatus[] }) => (): Partial<State> => ({
    processStatus: deps.processStatus,
  });
