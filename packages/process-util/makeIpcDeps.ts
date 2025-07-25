import { makeJsonOverStdio } from "^stdio-protocol";
import { BeeListeners, makeBeeLogChannel } from "^bee-common";

type Deps<MR extends {}> = {
  write: (str: string) => void;
} & Pick<BeeListeners<MR>, "onMessage" | "onLog" | "onStdout" | "onStderr">;

/**
 * Makes ipc from standard stdio listeners and write.
 *
 * features
 *  - Make ipc possible over stdio
 *  - Stdio is still usable as before. Like nothing is different.
 *
 */
export const makeIpcDeps = <MR extends {}, MS extends {}>(deps: Deps<MR>) => {
  //bee logs

  const { onMessage, beeChannelToken } = makeBeeLogChannel(
    deps.onMessage,
    deps.onLog
  );

  //the ipc

  const { stdioProtocolId, onStdout, onStderr, flush, send } =
    makeJsonOverStdio<MR, MS>(
      deps.write,
      onMessage,
      deps.onStdout,
      deps.onStderr
    );

  //new deps

  return {
    send,
    onStdout,
    onStderr,
    flush,
    stdioProtocolId,
    beeChannelToken,
  };
};
