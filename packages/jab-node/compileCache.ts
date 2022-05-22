import { nodeRequire } from "./node-module-util";

const { NativeCompileCache } = nodeRequire(
  "E:/work/repos/v8-compile-cache/v8-compile-cache"
);

/**
 *
 */
export const installCompileCache = () => {
  const blobStore = new CompileCacheMap();

  const nativeCompileCache = new NativeCompileCache();
  nativeCompileCache.setCacheStore(blobStore);
  nativeCompileCache.install();
};

/**
 *
 */
export class CompileCacheMap {
  private _memoryBlobs: any;

  constructor() {
    this._memoryBlobs = {};
  }

  get(key: string, _invalidationKey: string) {
    return this._memoryBlobs[key];
  }

  set(key: string, _invalidationKey: string, buffer: Buffer) {
    this._memoryBlobs[key] = buffer;
  }

  delete(key: string) {
    throw new Error("Shouldn't happen");
  }

  isDirty() {
    throw new Error("Shouldn't happen");
  }

  save() {
    throw new Error("Shouldn't happen");
  }
}
//
//
