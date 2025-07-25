import { AbsoluteFile, Diagnostic } from "^jab";
import {
  PackageCollection,
  FullProjectFilesystemProv,
  ProjectFilesystemProv as ProjectFilesystemProv,
} from "./internal";

export type File = { name: string; data: string };

export type DiagnosticWithoutFile = Omit<Diagnostic, "file">;

export type PackageOutput = { files: File[] } | { diagnostics: Diagnostic[] };

export type CacheEntry = { id: string; data: any };

//
// ProjectFilesystem
//

export type ProjectFilesystemLog =
  | {
      type: "file-changed";
      file: string;
    }
  | {
      type: "file-read";
      file: string;
      hit: boolean;
    }
  | {
      type: "file-read-sync";
      file: string;
    }
  | {
      type: "file-write";
      file: string;
      hit: boolean;
    }
  | {
      type: "file-watch";
      file: string;
    }
  | {
      type: "file-watch-remove-all";
    };

//
// PackageCollection
//

export type PackageState = {
  id: string;
  pack: PackageProv;
};

export type PackageCollectionCache = {
  diagnoticsCache?: PackageCollection["diagnoticsCache"];
  referenceCache?: PackageCollection["referenceCache"];
  packages?: CacheEntry[];
};

//
// Package
//

/**
 *
 */
export type PackageProv = {
  ownsAbsfile: (absFile: string) => boolean;

  onFileChange: (absFile: string) => void;

  getSourceFiles: () => string[];

  getFileDependencies: () => string[];

  getAllSourceOutput: () => Promise<File[]>;

  getSourceFileOutput: (absFile: string) => Promise<string>;

  getDiagnostics: () => Diagnostic[];

  setCache: (cache: any) => void;

  getCache: () => any;
};

//
// linting
//

export type PluginConstructor = (prov: PluginProv) => Plugin;

export type PluginProv = {
  rootFolder: AbsoluteFile;
  getAbsoluteFilesInGit: () => AbsoluteFile[];
  getPackageJson: (folder: AbsoluteFile) => Promise<any>;
  projectFilesystem: ProjectFilesystemProv;
} & ProjectFilesystemProv;

export type Plugin = {
  includeFile?: (file: AbsoluteFile) => boolean;
  getFiles?: () => AbsoluteFile[] | Promise<AbsoluteFile[]>;
  mapFile?: (content: string) => string | Promise<string>;
  getDiagnostics?: (
    content: string,
    file: AbsoluteFile
  ) => DiagnosticWithoutFile[];
};

//
// manager
//

export type Storage = {
  filesWatched: Map<AbsoluteFile, string>;
};

export type MakeSubManager = (prov: {
  pfs: FullProjectFilesystemProv;
}) => SubManager;

export type SubManager = {
  includeFile?: (file: AbsoluteFile) => boolean;
  getFiles?: () => AbsoluteFile[] | Promise<AbsoluteFile[]>;
  getDiagnostics?: (file: AbsoluteFile) => DiagnosticWithoutFile[];
};
