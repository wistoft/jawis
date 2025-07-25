import { CompileService, Diagnostic } from "^jab";
import {
  PackageCollection,
  PackageCollectionDeps,
  ProjectFilesystem,
  ProjectFilesystemDeps,
} from "./internal";

export type ProjectDeps = {
  onDiagnostics: (diag: Diagnostic[]) => void;
} & ProjectFilesystemDeps &
  Omit<PackageCollectionDeps, "cache">;

/**
 *
 * - Aggregate cache for all packages.
 *
 */
export class Project implements CompileService {
  public packageCollection: PackageCollection;
  public pfs: ProjectFilesystem;

  /**
   *
   */
  constructor(private deps: ProjectDeps) {
    //file system

    this.pfs = new ProjectFilesystem(deps);

    //todo: load cache

    const cache = undefined;

    //package collection

    this.packageCollection = new PackageCollection({
      ...deps,
      cache,
    });
  }

  /**
   * maybe this just transpiles.
   */
  public load = (absFile: string) =>
    this.packageCollection.getSourceFileOutput(absFile);

  /**
   * is there more to do here?
   */
  public shutdown = () => this.pfs.shutdown();
}
