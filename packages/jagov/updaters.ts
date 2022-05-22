import { ScriptStatus } from "^jagoc";
import { State } from "./types";

/**
 *
 */
export const setProcessStatusUpdater =
  (deps: { processStatus: ScriptStatus[] }) => (): Partial<State> => ({
    processStatus: deps.processStatus,
  });
