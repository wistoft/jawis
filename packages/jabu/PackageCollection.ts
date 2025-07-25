import deepEqual from "deep-equal";

import { err, Diagnostic } from "^jab";
import { topologicalSort } from "^assorted-algorithms";
import {
  PackageCollectionCache,
  PackageOutput,
  PackageProv,
  PackageState,
} from "./internal";

export type PackageCollectionDeps = {
  packages: Map<string, PackageProv>;
  cache?: PackageCollectionCache;
  trustCache: boolean;
};

/**
 *
 * - Common interface for all packages.
 * - Maintains dependency graph
 *
 */
export class PackageCollection {
  private diagnoticsCache: Map<string, Diagnostic[]> = new Map();
  private referenceCache: Map<string, Set<string>> = new Map();

  /**
   *
   */
  constructor(private deps: PackageCollectionDeps) {
    //use cache data

    if (this.deps.cache) {
      this.setCache(this.deps.cache);
    }
  }

  /**
   *
   */
  public onFileChange = (absFile: string) => {
    const { id, pack } = this.getPackageFromAbsFile(absFile);

    pack.onFileChange(absFile);

    //invalidate all caches for the package

    this.diagnoticsCache.delete(id);
    this.referenceCache.delete(id);
  };

  /**
   * Emit files from all packages.
   *
   * - Only emits packages if they and their dependencies are free of diagnostics.
   * - Stops at the first package with diagnostics, and emits those.
   * - A package is either emitted fully, or not at all.
   *
   */
  public getAllSourceOutput = () => {
    const topoOrder = this.getTopoOrder();

    const res: any[] = [];

    for (const id of topoOrder) {
      const pack = this.getPackageFromId(id);

      const output = this.getPackageOutput(pack);

      res.push(output);

      if ("diagnostics" in output) {
        break;
      }
    }

    return res;
  };

  /**
   *
   */
  public getPackageOutputFromId = (packId: string) =>
    this.getPackageOutput(this.getPackageFromId(packId));

  /**
   *
   */
  private getPackageOutput = async ({
    id,
    pack,
  }: PackageState): Promise<PackageOutput> => {
    const diagnostics = this.getDiagnosticsFromId(id);

    if (diagnostics.length !== 0) {
      return { diagnostics };
    }

    const files = await pack.getAllSourceOutput();

    return { files };
  };

  /**
   * Emit a single source file.
   *
   * same as: CompileService.load
   *
   */
  public getSourceFileOutput = (absFile: string) => {
    const { pack } = this.getPackageFromAbsFile(absFile);

    return pack.getSourceFileOutput(absFile);
  };

  /**
   * Get diagnostics from all packages.
   *
   * - One package is returned at a time.
   *
   */
  public getAllDiagnostics = () => {
    const topoOrder = this.getTopoOrder();

    for (const id of topoOrder) {
      const diags = this.getDiagnosticsFromId(id);

      if (diags.length !== 0) {
        return diags;
      }
    }

    return [];
  };

  /**
   *
   */
  public getDiagnosticsFromId = (packId: string) => {
    const cached = this.diagnoticsCache.get(packId);

    if (this.deps.trustCache && cached !== undefined) {
      return cached;
    }

    //produce value

    const data = this.getPackageFromId(packId).pack.getDiagnostics();

    //update or verify cache

    if (cached === undefined) {
      // update cache
      this.diagnoticsCache.set(packId, data);
    } else {
      // verify cached data
      if (!this.deps.trustCache && !deepEqual(cached, data, { strict: true })) {
        console.log({
          cached,
          data,
        });
        err("getDiagnosticsFromId - cache was corrupted", {
          cached,
          data,
        });
      }
    }

    //return

    return data;
  };

  /**
   *
   */
  public getReferencesFromId = (packId: string) => {
    const cached = this.referenceCache.get(packId);

    if (this.deps.trustCache && cached !== undefined) {
      return cached;
    }

    //produce value

    const data = this.getReferencedPackages(this.getPackageFromId(packId));

    //update or verify cache

    if (cached === undefined) {
      // update cache
      this.referenceCache.set(packId, data);
    } else {
      // verify cached data
      if (!this.deps.trustCache && !deepEqual(cached, data, { strict: true })) {
        err("getReferencesFromId - cache was corrupted", { cached, data });
      }
    }

    //return

    return data;
  };

  /**
   *
   */
  public getReferencedPackages = ({ pack }: PackageState) => {
    const res = new Set<string>();
    const files = pack.getFileDependencies();

    for (const file of files) {
      res.add(this.getPackageFromAbsFile(file).id);
    }

    return res;
  };

  /**
   *
   */
  public getCache = (): PackageCollectionCache => ({
    diagnoticsCache: this.diagnoticsCache,
    referenceCache: this.referenceCache,
    packages: Array.from(this.deps.packages).map(([id, pack]) => ({
      id,
      data: pack.getCache(),
    })),
  });

  /**
   *
   */
  private setCache = (cache: PackageCollectionCache) => {
    //own state

    cache.diagnoticsCache && (this.diagnoticsCache = cache.diagnoticsCache);
    cache.referenceCache && (this.referenceCache = cache.referenceCache);

    //fill packages with cache data

    for (const cacheEntry of cache.packages ?? []) {
      const { pack } = this.getPackageFromId(cacheEntry.id);
      pack.setCache(cacheEntry.data);
    }
  };

  /**
   *
   */
  private getPackageFromId = (packId: string) => {
    const pack = this.deps.packages.get(packId);

    if (pack === undefined) {
      throw new Error("getPackageFromId - package not found: " + packId);
    }

    return { id: packId, pack };
  };

  /**
   *
   */
  public getPackageFromAbsFile = (absFile: string) => {
    const res: Array<PackageState> = [];

    for (const [id, pack] of this.deps.packages.entries()) {
      if (pack.ownsAbsfile(absFile)) {
        res.push({ id, pack });
      }
    }

    if (res.length !== 1) {
      err("getPackageFromAbsFile - package not found.", { absFile, res });
    }

    return res[0];
  };

  /**
   *
   */
  private getTopoOrder = () =>
    topologicalSort<string>(
      this.referenceCache.keys(),
      this.getReferencesFromId
    );
}
