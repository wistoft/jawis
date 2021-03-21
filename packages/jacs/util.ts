import { nodeRequire } from "^jab-node";

/**
 * This is hacky
 */
export const unRegisterTsCompiler = () => {
  delete nodeRequire.extensions[".ts"];
  delete nodeRequire.extensions[".tsx"];
};
