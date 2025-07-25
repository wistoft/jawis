import ts, { CompilerOptions } from "typescript";

import { AbsoluteFile, CanonicalFile, assert, err, tos } from "^jab";
import {
  assertAbsolute,
  listFilesRecursiveSync,
  makeCanonical,
} from "^jab-node";

import { FullProjectFilesystemProv } from "./internal";

export type TsManagerHostDeps = {
  options: CompilerOptions;
  folder: string;
  projectFilesystem: FullProjectFilesystemProv;

  //for testing
  debug?: (str: string) => void;
  ignoreNodeModulesTypes?: boolean;
};

export class TsManagerHost
  implements ts.LanguageServiceHost, ts.ModuleResolutionHost
{
  private versions: Map<CanonicalFile, number> = new Map();
  private default_ts_host = ts.createCompilerHost({});

  constructor(private deps: TsManagerHostDeps) {
    this.setFiles();

    this.deps.projectFilesystem.registerOnFileChange(this.onFileChange);
  }

  /**
   *
   */
  private setFiles = () => {
    const newFiles = listFilesRecursiveSync(
      assertAbsolute(this.deps.folder)
    ).filter((file) => {
      //where to put this filter
      return file.endsWith(".ts");
    });

    this.versions = new Map();

    //set versions to zero

    for (const _file of newFiles) {
      this.versions.set(makeCanonical(_file), 0);
    }
  };

  /**
   *
   */
  private onFileChange = (_file: AbsoluteFile) => {
    const file = makeCanonical(_file);

    const version = this.versions.get(file) ?? 0;

    this.versions.set(file, version + 1);
  };

  /**
   *
   */
  private assertCanonical = (_file: string) => {
    const file = makeCanonical(_file as any);
    const file2 = this.default_ts_host.getCanonicalFileName(_file);

    if (file !== _file || file2 !== _file) {
      err("File must be canonical", { file: _file, canonical_ts: file, canonical_jab: file }); // prettier-ignore
    }

    return file;
  };

  /**
   *
   */
  public getScriptFileNames = () => {
    const res = Array.from(this.versions.keys());

    this.deps.debug?.("getScriptFileNames: " + tos(res));

    return res;
  };

  /**
   *
   */
  public getScriptVersion = (_file: string) => {
    this.deps.debug?.("getScriptVersion: " + _file);

    const file = this.assertCanonical(_file);

    if (!this.deps.projectFilesystem.fileExistsSync(file)) {
      throw new Error("Unknown file: " + file);
    }

    return this.versions.get(file)?.toString() ?? "0"; //no need to set, if was zero.
  };

  /**
   *
   */
  public getScriptSnapshot = (file: string) => {
    this.deps.debug?.("getScriptSnapshot: " + file);

    const absFile = this.assertCanonical(file);

    if (!this.deps.projectFilesystem.fileExistsSync(absFile)) {
      return;
    } else {
      return ts.ScriptSnapshot.fromString(
        this.deps.projectFilesystem.readFileSync(absFile).toString()
      );
    }
  };

  /**
   *
   */
  public fileExists = (file: string, ...args: any[]) => {
    assert(args.length === 0);

    const res = this.deps.projectFilesystem.fileExistsSync(file);

    if (res) {
      this.deps.debug?.("fileExists: " + file);
    } else {
      this.deps.debug?.("fileExists, not: " + file);
    }

    return res;
  };

  /**
   *
   */
  public readFile = (file: string, ...args: any[]) => {
    assert(args.length === 0);

    const res = this.deps.projectFilesystem.readFileSync(file);

    if (res !== undefined) {
      this.deps.debug?.("readFile: " + file);
    } else {
      this.deps.debug?.("readFile, not: " + file);
    }

    return res;
  };

  /**
   *
   */
  public directoryExists = (path: string, ...args: any[]) => {
    assert(args.length === 0);

    if (
      this.deps.ignoreNodeModulesTypes &&
      path.endsWith("node_modules/@types")
    ) {
      //quick fix, so it doesn't read all type files when unit testing
      // only performance optimization
      this.deps.debug?.("directoryExists, ignored: " + path);
      return false;
    }

    const res = this.deps.projectFilesystem.directoryExistsSync(path);

    if (res) {
      this.deps.debug?.("directoryExists: " + path);
    } else {
      this.deps.debug?.("directoryExists, not: " + path);
    }

    return res;
  };

  /**
   *
   * https://github.com/microsoft/TypeScript/issues/46788
   */
  public readDirectory = () => {
    throw new Error("not impl");
  };

  getDirectories = (path: string, ...args: any[]) => {
    assert(args.length === 0);

    this.deps.debug?.("getDirectories: " + path);

    return ts.sys.getDirectories(path);
  };

  getCurrentDirectory = () => {
    this.deps.debug?.("getCurrentDirectory");

    return makeCanonical(
      this.deps.projectFilesystem.getCurrentDirectory() as AbsoluteFile
    );
  };

  getCompilationSettings = () => this.deps.options;

  getCanonicalFileName = () => {
    throw new Error("not impl");
  };

  getDefaultLibFileName = (options: CompilerOptions) => {
    const res = makeCanonical( ts.getDefaultLibFilePath(options) as AbsoluteFile ); // prettier-ignore

    this.deps.debug?.("getDefaultLibFileName: " + res);

    return res;
  };
}
