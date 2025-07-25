import exit from "exit";

import {
  BeeDef,
  BeeProv,
  makeBeeOnError,
  makeSendTunneledLog,
  runBee,
} from "^bee-common";
import {
  postMessage,
  registerErrorHandlers,
  registerOnMessage,
  removeOnMessage,
} from "^jab-node";

/**
 *
 */
export const getBeeProv = (
  channelToken: string | number,
  esmImport: boolean,
  beeSend: (msg: any) => void = postMessage
): BeeProv => {
  const sendLog = makeSendTunneledLog(beeSend, channelToken);
  const { onError } = makeBeeOnError(sendLog);
  const importModule = esmImport
    ? (filename: string) =>
        import(/* webpackIgnore: true */ "file://" + filename)
    : (filename: string) =>
        Promise.resolve().then(() =>
          eval("require.eager || require")(filename)
        );

  const beeProv: BeeProv = {
    beeSend,
    sendLog,
    beeExit,
    onError,
    registerErrorHandlers,
    registerOnMessage,
    removeOnMessage,
    importModule,
    runBee: (beeDef: BeeDef, setGlobal) => runBee(beeProv, beeDef, setGlobal),
  };

  return beeProv;
};

/**
 *
 * notes on stdio
 *  - async exit is the best possible, if stdio is to be flushed.
 *  - This means the process will keep on running for a while, even though it suppresses stdio.
 *    It's observable by doing `fs.writeFileSync` or `process.send`.
 *
 *  - jago ipc messages does not suffer the same problem as stdio does.
 *      They will be sent even though `process.exit` is called or uh-exception.
 */
export const beeExit = () => {
  exit();
};
