import { BeeProv } from "^bee-common";
import {
  postMessage,
  registerErrorHandlers,
  registerOnMessage,
  removeOnMessage,
} from "^jab-node";

/**
 *
 */
export const getBeeProv = (): BeeProv => {
  const importModule = (filename: string) =>
    Promise.resolve().then(() => eval("require.eager || require")(filename));

  const beeProv: BeeProv = {
    beeSend: postMessage,
    beeExit,
    registerErrorHandlers,
    registerOnMessage,
    removeOnMessage,
    importModule,
  };

  return beeProv;
};

/**
 *
 */
export const beeExit = () => {
  process.exit();
};
