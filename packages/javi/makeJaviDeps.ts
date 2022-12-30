import { FileService } from "^jabc";
import { compareFiles, handleOpenFileInVsCode } from "./internal";

export type JaviDefaultDeps = {
  projectRoot: string;
};

/**
 *
 */
export const makeJaviDeps = (deps: JaviDefaultDeps) => {
  const fileService: FileService = {
    handleOpenFileInEditor: handleOpenFileInVsCode,
    handleOpenRelativeFileInEditor: (location) =>
      handleOpenFileInVsCode(location, deps.projectRoot),
    compareFiles,
  };

  return {
    fileService,
  };
};
