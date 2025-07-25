import { FileService } from "^jab";
import { makeMakeJacsWorkerBee } from "^jacs";
import {
  JaviServiceNew,
  makeCompareFiles,
  makeHandleOpenFileInVsCode,
} from "./internal";

/**
 *
 */
export const makeTsBeeService = async (javiService: JaviServiceNew) => {
  const mainProv = await javiService.getService("@jawis/javi/mainProv");

  return makeMakeJacsWorkerBee({
    ...mainProv,
    cacheNodeResolve: true,
    lazyRequire: false,
    module: "commonjs",
  });
};

/**
 * Rename to externalProgramService
 */
export const makeFileService = (javiService: JaviServiceNew): FileService => {
  const handleOpenFileInEditor = makeHandleOpenFileInVsCode(
    javiService.getRootConfig("@jawis/javi/fileService/vsCodeBinary")
  );

  return {
    handleOpenFileInEditor,
    handleOpenRelativeFileInEditor: (location) =>
      handleOpenFileInEditor(
        location,
        javiService.getRootConfig("@jawis/javi/fileService/projectRoot")
      ),
    compareFiles: makeCompareFiles(
      javiService.getRootConfig("@jawis/javi/fileService/winMergeBinary")
    ),
  };
};
