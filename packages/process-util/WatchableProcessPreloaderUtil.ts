import { MainFileDeclaration } from "^jab";
import { ResolveFilename } from "^node-module-hooks-plus";

export const watchableProcessMainDeclaration: MainFileDeclaration = {
  type: "node-bee",
  file: "WatchableProcessMain",
  folder: __dirname,
};

export type RequireSenderMessage = {
  type: "require";
  file: string;
  source?: string;
};

/**
 * Get files required in the script.
 *
 *  - may send the same file multiple times.
 *
 *  todo:ignore node's native modules.
 *
 * impl
 *  - Node caches _resolveFilename by parent&request, so the wrapper function will be
 *      called for each parent of a script. Which is pretty much all the places it's required.
 */
export const makeMakeRequireSender =
  (parentSend: (msg: RequireSenderMessage) => void) =>
  (original: ResolveFilename): ResolveFilename =>
  (request, parent, isMain) => {
    const filename = original(request, parent, isMain);

    if (filename !== "fs") {
      parentSend({ type: "require", file: filename, source: parent?.filename });
    }

    return filename;
  };
