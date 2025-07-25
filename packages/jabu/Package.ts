import { AbsoluteFile, Diagnostic } from "^jab";
import { File, PackageProv } from "./internal";

export type PackageDeps = {
  workDir: string;
  onError: (error: unknown) => void;
};

/**
 *
 * - Does not know of any other packages.
 */
export class Package implements PackageProv {
  /**
   *
   */
  constructor(private deps: PackageDeps) {}

  /**
   *
   */
  public ownsAbsfile = (absFile: string) =>
    absFile.startsWith(this.deps.workDir);

  /**
   *
   */
  public onFileChange = (_absFile: string) => {};

  /**
   *
   */
  public getSourceFiles = () => ["dummy source file"];

  /**
   *
   */
  public getFileDependencies = () => ["other dummy source file"];

  /**
   * Emit all files.
   *
   */
  public getAllSourceOutput = (): Promise<File[]> => {
    return Promise.resolve([
      { name: "file1", data: "dummy emit of all files" },
    ]);
  };

  /**
   *
   */
  public getSourceFileOutput = (absFile: string) => {
    return Promise.resolve("dummy emit of: " + absFile);
  };

  /**
   * Get diagnostics from all files in package.
   *
   */
  public getDiagnostics = (): Diagnostic[] => {
    return [{ file: "" as AbsoluteFile, message: "dummy diagnostics" }];
  };

  /**
   *
   */
  public setCache = (_cache: any) => {};

  /**
   * - anything needed by this package to stay incremental.
   */
  public getCache = () => {
    return [""];
  };
}
