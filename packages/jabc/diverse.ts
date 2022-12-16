export type HandleOpenFileInEditor = (
  location: {
    file: string;
    line?: number;
  },
  baseFolder?: string
) => void;

export type CompareFiles = (file1: string, file2: string) => void;

export type FileService = {
  handleOpenFileInEditor: HandleOpenFileInEditor;
  handleOpenRelativeFileInEditor: HandleOpenFileInEditor;
  compareFiles: CompareFiles;
};

export type CompileService = {
  load: (absPath: string) => Promise<string>;
};
