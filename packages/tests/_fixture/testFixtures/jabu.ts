import { CompilerOptions } from "typescript";
import { TestProvision } from "^jarun";
import {
  Manager,
  ManagerDeps,
  Package,
  PackageCollection,
  PackageCollectionDeps,
  ProjectFilesystem,
  ProjectFilesystemDeps,
  ProjectFilesystemLog,
  TsManager,
} from "^jabu";
import { LintManager, LintManagerDeps } from "^jabu/LintManager";
import { DummyPackage } from "./jabu Package";
import {
  filterAbsoluteFilepath,
  filterAbsoluteFilepathInFreetext,
  getFixturePath,
  getProjectPath,
} from ".";

/**
 *
 */
export const getPackageCollection = (
  prov: TestProvision,
  extraDeps?: Partial<PackageCollectionDeps>
) => {
  const packages: Map<string, DummyPackage> = new Map([
    ["package1", new DummyPackage({ workDir: "/package1", prov })],
  ]);

  const col = new PackageCollection({
    packages,
    trustCache: false,
    ...extraDeps,
  });

  return { col, packages };
};

/**
 *
 */
export const getPackageCollection_empty = (
  prov: TestProvision,
  extraDeps?: Partial<PackageCollectionDeps>
) => {
  const packages: Map<string, Package> = new Map();

  return new PackageCollection({
    packages,
    trustCache: false,
    ...extraDeps,
  });
};

/**
 *
 */
export const getTsPlugin = (prov: TestProvision, folder: string) => {
  const options: CompilerOptions = {
    isolatedModules: true,
  };

  prov.finally(() => projectFilesystem.shutdown()); //gracefully shutdown. It's not the plugin's responsibility

  const projectFilesystem = getProjectFileSystem(prov, {
    log: () => {
      // can't log, because we don't control typescript's behavior. So it would be flacky.
    },
  });

  const manager = new TsManager({
    options,
    projectFilesystem,
    folder,
    ignoreNodeModulesTypes: true, //quick fix
    debug: () => {
      // console.log(str);
      // prov.log("pfs", str);
    },
  });

  return { manager, pfs: projectFilesystem };
};

/**
 *
 */
export const getProjectFileSystemLogger =
  (prov: TestProvision) => (log: ProjectFilesystemLog) => {
    const hit = (log as any)?.hit ? " - HIT" : "";
    const _file = (log as any)?.file;
    const file = _file ? ": " + filterAbsoluteFilepath(_file) : "";

    return prov.log("pfs", log.type + file + hit);
  };

/**
 *
 */
export const getProjectFileSystem = (
  prov: TestProvision,
  extra?: Partial<ProjectFilesystemDeps>
) =>
  new ProjectFilesystem({
    ...prov,
    rootFolder: getFixturePath(),
    watch: false,
    log: getProjectFileSystemLogger(prov),
    ...extra,
  });

/**
 *
 */
export const getLintManager = (
  prov: TestProvision,
  extraDeps?: Partial<LintManagerDeps>
) => {
  prov.finally(() => projectFilesystem.shutdown()); //gracefully shutdown. It's not the plugin's responsibility

  const projectFilesystem = getProjectFileSystem(prov);

  return new LintManager({
    ...prov,
    plugins: [],
    projectFilesystem,
    debug: () => {
      // console.log(str);
    },
    ...extraDeps,
  });
};

/**
 *
 */
export const getManager = (
  prov: TestProvision,
  extraDeps?: Partial<ManagerDeps>
) =>
  new Manager({
    ...prov,

    //Manager
    subManagers: [],
    storage: {
      filesWatched: new Map(),
    },
    autofix: false,
    diagnostics: false,
    watch: false,

    //pfs
    rootFolder: getFixturePath(),
    log: getProjectFileSystemLogger(prov),
    ...extraDeps,
  });
