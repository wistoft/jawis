import { BeeListeners } from "^bee-common";
import { makeIpcDeps } from "./internal";

type Deps<P extends Process, MR extends {}> = {
  makeProcess: MakeProcess<P>;
} & Pick<BeeListeners<MR>, "onMessage" | "onLog" | "onStdout" | "onStderr">;

type MakeProcess<P extends Process> = (deps: {
  onStdout: (data: Buffer) => void;
  onStderr: (data: Buffer) => void;
}) => P;

type Process = {
  write: (data: string) => void;
};

/**
 *
 * Similar: makeStdioIpcProcess, StdioIpcProcess
 */
export const makeStdioIpcProcess = <
  P extends Process,
  MR extends {},
  MS extends {},
>(
  deps: Deps<P, MR>
) => {
  const write = (str: string) => proc.write(str);

  //transform deps

  const { onStdout, onStderr, flush, send, stdioProtocolId, beeChannelToken } =
    makeIpcDeps<MR, MS>({
      ...deps,
      write,
    });

  // create

  // how to give flush to this one

  const proc = deps.makeProcess({
    onStdout,
    onStderr,
  });

  // return

  return {
    ...proc,
    send,
    stdioProtocolId,
    beeChannelToken,
  };
};
