import { AbsoluteFile, Diagnostic } from "^jab";
import { File, PackageProv } from "^jabu";
import { TestProvision } from "^jarunc/internal";

type DummyPackageDeps = {
  workDir: string;
  prov: TestProvision;
};

/**
 *
 */
export class DummyPackage implements PackageProv {
  public sourceFiles: string[] = ["dummy source file"];
  public fileDependencies: string[] = ["other dummy source file"];
  public allSourceOutput: File[] = [
    { name: "file1", data: "dummy file content" },
  ];
  public sourceFileOutput = "dummy sourceFileOutput";
  public diagnostics: Diagnostic[] = [
    { file: "" as AbsoluteFile, message: "dummy diagnostics" },
  ];

  constructor(private deps: DummyPackageDeps) {}

  //hacky implemented
  public ownsAbsfile = (absFile: string) => absFile.startsWith(this.deps.workDir); // prettier-ignore

  public onFileChange = () => {};

  public getSourceFiles = () => this.sourceFiles;

  public getFileDependencies = () => this.fileDependencies;

  public getAllSourceOutput = (): Promise<File[]> => Promise.resolve(this.allSourceOutput); // prettier-ignore

  public getSourceFileOutput = () => Promise.resolve(this.sourceFileOutput); // prettier-ignore

  public getDiagnostics = (): Diagnostic[] => this.diagnostics;

  public setCache = () => {
    this.deps.prov.div("DummyPackage ignores setCache");
  };

  public getCache = () => {
    return "DummyPackage cache";
  };
}
