import isBuiltinModule from "is-builtin-module";
import { SharedMap as SharedMapType } from "sharedmap";
import { ResolveFilename } from "^node-module-hooks-plus";

//hack because of typing mismatch.

let SharedMap = require("sharedmap") as typeof SharedMapType;

if ((SharedMap as any).default) {
  //ESM quick fix needed if webpack compiles this file.
  SharedMap = (SharedMap as any).default;
}

export type ResolveCacheMap = {
  get: (key: string) => string | undefined | null;
  set: (key: string, value: string) => void;
};

/**
 *
 */
export const makeSharedResolveMap = (): ResolveCacheMap => {
  const maxEntries = 10000;

  // Size is in UTF-16 codepoints
  const keySize = 300;
  const valueSize = 200;

  return new SharedMap(maxEntries, keySize, valueSize);
};

/**
 * Caches resolved files in node_modules.
 *
 * - Doesn't cache native modules, because that makes no sense.
 * - Doesn't cache files in project, because they change, and invalidate logic is then needed
 *
 * todo: support esm modules
 *
 * impl
 *  - Use \x01 byte as separator, because SharedMap uses \x00
 */
export const makeMakeCachedResolve =
  (sharedMap: ResolveCacheMap) =>
  (original: ResolveFilename): ResolveFilename => {
    // Manually restore the prototype of SharedMap
    Object.setPrototypeOf(sharedMap, SharedMap.prototype);

    return (request, parent, isMain) => {
      if (isMain) {
        //don't know what is special, so let node handle it.
        return original(request, parent, isMain);
      }

      if (!parent) {
        //what else to do for esm.
        return original(request, parent, isMain);
        // throw new Error("cached resolve not implemented for esm.");
      }

      const key = request + "\x01" + parent.path;

      const cachedValue = sharedMap.get(key);

      if (cachedValue) {
        return cachedValue;
      }

      const newValue = original(request, parent, isMain);

      if (!isBuiltinModule(request) && newValue.includes("node_modules")) {
        sharedMap.set(key, newValue);
      }

      return newValue;
    };
  };
