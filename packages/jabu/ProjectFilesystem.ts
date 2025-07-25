import path from "node:path";
import fs from "node:fs";
import filewatcher from "filewatcher";

import { AbsoluteFile, FinallyFunc, assert, prej } from "^jab";
import { PromiseTriple, getPromise } from "^yapu";
import { makeCanonical } from "^jab-node";
import { ProjectFilesystemLog } from "./internal";

export type ProjectFilesystemDeps = {
  rootFolder: AbsoluteFile;
  watch: boolean;
  log: (log: ProjectFilesystemLog) => void;
  onError: (error: unknown) => void;
  finally: FinallyFunc;
};

//for plugins
export type ProjectFilesystemProv = {
  getRootFolder: () => AbsoluteFile;
  getCurrentDirectory: () => string;

  readFile: (absFile: string) => Promise<string>;
  writeFile: (absFile: AbsoluteFile, content: string) => Promise<void>;
  readdirRelative: (folder: AbsoluteFile) => Promise<string[]>;

  fileExistsSync: (absFile: string) => boolean;
  directoryExistsSync: (absFile: string) => boolean;
  readFileSync: (absFile: string) => string;
};

export type FullProjectFilesystemProv = ProjectFilesystemProv & {
  awaitFileChange: () => Promise<void>;
  getDirtyFiles: () => AbsoluteFile[];
  registerOnFileChange: (callback: (file: AbsoluteFile) => void) => void;
  watchFile: (file: AbsoluteFile) => void;
  shutdown: () => Promise<void>;
};

/**
 *
 * related
 *  - https://www.npmjs.com/package/watch-dependency-graph
 */
export class ProjectFilesystem implements FullProjectFilesystemProv {
  private watcher: any;
  private state: "active" | "inactive" = "active";

  private filesChanged: PromiseTriple<void>;
  private onFileChangeListeners: any[] = [];

  private cache: Map<string, string> = new Map();

  //must be extracted, so it can be used by more than one.
  private dirtyFiles: Set<AbsoluteFile> = new Set();

  /**
   *
   */
  constructor(private deps: ProjectFilesystemDeps) {
    this.filesChanged = getPromise();

    //watcher

    if (deps.watch) {
      this.watcher = filewatcher();

      this.watcher.on("change", this.emitFileChange);

      this.watcher.on("fallback", () => {
        this.deps.onError(new Error("filewatcher fallback"));
      });
    }

    //ensure clean shutdown

    this.deps.finally(() => {
      assert(this.state === "inactive", "ProjectFileSystem should have been shutdown"); // prettier-ignore
    });
  }

  /**
   *
   */
  public emitFileChange = (_file: AbsoluteFile) => {
    const file = makeCanonical(_file);

    this.deps.log({ type: "file-changed", file });

    this.filesChanged.resolve();
    this.filesChanged = getPromise();

    //keep track

    this.dirtyFiles.add(file as any);

    //cache

    this.cache.delete(file);

    //

    this.onFileChangeListeners.forEach((callback) => callback(_file));
  };

  /**
   *
   */
  public awaitFileChange = () => this.filesChanged.promise;

  /**
   *
   */
  public getDirtyFiles = () => {
    const tmp = Array.from(this.dirtyFiles);

    this.dirtyFiles = new Set();

    return tmp;
  };

  /**
   *
   */
  public registerOnFileChange = (callback: (file: AbsoluteFile) => void) => {
    this.onFileChangeListeners.push(callback);
  };

  /**
   *
   */
  public watchFile = (_file: AbsoluteFile) => {
    const file = makeCanonical(_file);

    if (this.deps.watch) {
      this.deps.log({ type: "file-watch", file });
      this.watcher.add(file);
    }
  };

  /**
   *
   */
  public getRootFolder = () => makeCanonical(this.deps.rootFolder) as any;

  /**
   *
   */
  public getCurrentDirectory = () => process.cwd();

  /**
   *
   */
  public fileExistsSync = (absFile: string) => {
    return fs.existsSync(absFile);
  };

  /**
   *
   */
  public directoryExistsSync = (absFile: string) => {
    return fs.existsSync(absFile);
  };

  /**
   *
   */
  public readFileSync = (absFile: string) => this.readFileReal(absFile, false);

  /**
   *
   */
  public readFile = (absFile: string) => this.readFileReal(absFile, true);

  /**
   *
   */
  private readFileReal = (_file: string, async: boolean): any => {
    const absFile = makeCanonical(_file as any);

    if (!path.isAbsolute(absFile)) {
      return prej("absFile must be absolute: " + absFile);
    }

    const cachedData = this.cache.get(absFile);

    if (cachedData) {
      this.deps.log({ type: "file-read", file: absFile, hit: true });
      return Promise.resolve(cachedData);
    }

    this.watchFile(absFile as any);

    this.deps.log({ type: "file-read", file: absFile, hit: false });

    if (async) {
      return fs.promises.readFile(absFile).then((_data) => {
        const data = _data.toString();

        this.cache.set(absFile, data);

        return data;
      });
    } else {
      const data = fs.readFileSync(absFile).toString();

      this.cache.set(absFile, data);

      return data;
    }
  };

  /**
   *  - Writes only if file has changed.
   *
   */
  public writeFile = (_file: AbsoluteFile, content: string) => {
    const absFile = makeCanonical(_file);

    const cachedData = this.cache.get(absFile);

    if (cachedData === content) {
      this.deps.log({ type: "file-write", file: absFile, hit: true });
      return Promise.resolve();
    } else {
      this.deps.log({ type: "file-write", file: absFile, hit: false });
    }

    return fs.promises.writeFile(absFile, content);
  };

  /**
   *
   */
  public readdirRelative = (folder: AbsoluteFile) => {
    this.watchFile(folder);

    return fs.promises.readdir(folder);
  };

  /**
   *
   */
  public shutdown = () => {
    if (this.deps.watch) {
      this.deps.log({ type: "file-watch-remove-all" });
      this.watcher.removeAll();
    }

    this.state = "inactive";

    return Promise.resolve();
  };
}
