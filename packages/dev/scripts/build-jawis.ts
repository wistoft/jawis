import { compileJawisFiles } from "./build";
import { makeLiveJawisBuildManager } from "./build";
import { publishBuildFolder, relativeWebBuildFolder } from "../project.conf";

makeLiveJawisBuildManager()
  .build()
  .then(() =>
    compileJawisFiles({
      buildFolder: publishBuildFolder,
      keepSubFoldersInNodeBeesAndPlainFiles: true,
      relativeWebBuildFolder,
    })
  )
  .catch(console.log);
