import { Waiter } from "^state-waiter";
import { AbsoluteFile, assert, emitVsCodeError } from "^jab";
import { makeCanonical } from "^jab-node";
import { getAbsoluteFilesInGit } from "^git-util";
import {
  ProjectFilesystem,
  ProjectFilesystemDeps,
  Storage,
  SubManager,
  MakeSubManager,
} from "./internal";

export type ManagerDeps = {
  subManagers: MakeSubManager[];
  storage: Storage;
  autofix: boolean;
  diagnostics: boolean;
  watch: boolean;
} & ProjectFilesystemDeps;

type States = "initial" | "running" | "stopping" | "stopped";

/**
 *
 * - Coordinate all work.
 * - Load and store the aggregated cache for all submanagers.
 * - Commit autofixes
 * - Emit diagnostics
 *
 */
export class Manager {
  public pfs: ProjectFilesystem;
  public waiter: Waiter<States, never>;
  public subManagers: SubManager[];

  //state

  public uncheckFiles: AbsoluteFile[];
  public dirtyDianosticsFiles: AbsoluteFile[] = [];
  public allFiles?: AbsoluteFile[];

  /**
   *
   */
  constructor(private deps: ManagerDeps) {
    //waiter

    this.waiter = new Waiter<States>({
      onError: deps.onError,
      startState: "initial",
      stoppingState: "stopping",
      endState: "stopped",
    });

    //initial work

    this.uncheckFiles = Array.from(deps.storage.filesWatched.keys());

    //file system

    this.pfs = new ProjectFilesystem(deps);

    //

    this.subManagers = deps.subManagers.map((sub) => sub({ pfs: this.pfs }));
  }

  /**
   *
   */
  public start = async () => {
    const state = this.waiter.getState();

    assert(state === "initial", "Should be in state initial, was: " + state);

    this.waiter.set("running");

    await this.loop();
  };

  /**
   *
   */
  private loop = async (): Promise<void> => {
    const next = this.tryGetNextTask();

    if (next === undefined) {
      return;
    }

    await next;

    //start next

    if (this.waiter.is("running")) {
      return this.loop();
    }
  };

  /**
   *
   */
  private tryGetNextTask = (): Promise<void> | undefined => {
    // ensure all hidden changes are emitted, to avoid emitting fixed errors.

    const nextFile = this.uncheckFiles.pop();

    if (nextFile !== undefined) {
      return this.handleUncheckedFile(nextFile);
    }

    // get initial list of all files

    if (this.allFiles === undefined) {
      return this.setInitialFiles();
    }

    // diaganostics

    if (this.deps.diagnostics && this.dirtyDianosticsFiles.length !== 0) {
      return this.emitDiagnosticsForNextFile();
    }
  };

  /**
   *
   */
  private emitDiagnosticsForNextFile = async () => {
    const file = this.dirtyDianosticsFiles.pop()!;

    for (const sub of this.subManagers) {
      if (!sub.getDiagnostics) {
        continue;
      }

      const diags = sub.getDiagnostics(file);

      diags.forEach((diag) => {
        emitVsCodeError({ ...diag, file });
      });
    }
  };

  /**
   *
   */
  private setInitialFiles = async () => {
    this.allFiles = [];

    for (const sub of this.subManagers) {
      const files = await this.getFiles(sub);

      this.allFiles = [...new Set([...this.allFiles, ...files])];
    }

    for (const file of this.allFiles) {
      this.pfs.watchFile(file);
    }

    this.dirtyDianosticsFiles = [...this.allFiles];
  };

  /**
   *
   */
  private handleUncheckedFile = async (file: AbsoluteFile) => {
    //check for hidden changes

    const actualContent = await this.pfs.readFile(file);
    const cachedContent = this.deps.storage.filesWatched.get(file);

    if (actualContent !== cachedContent) {
      // emit synthetic file change
      this.pfs.emitFileChange(file);
    }
  };

  /**
   *
   */
  private getFiles = async (subManager: SubManager) => {
    //explicit files

    let files = (await subManager.getFiles?.()) ?? [];

    // files by pattern

    if (subManager.includeFile) {
      const rootFolder = this.pfs.getRootFolder();

      const files2 = getAbsoluteFilesInGit(rootFolder)
        .map((file) => makeCanonical(file) as any)
        .filter((file) => file.startsWith(rootFolder))
        .filter((file) => subManager.includeFile?.(file));

      files = [...new Set([...files, ...files2])];
    }

    //concat

    return files;
  };

  /**
   *
   */
  public shutdown = () =>
    this.waiter.shutdown(async () => {
      await this.pfs.shutdown();

      this.waiter.onClose();
    });
}
