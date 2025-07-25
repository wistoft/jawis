import { makeJawisBuildManager, compileJawisFiles } from "./build";
import {
  projectRoot,
  alphaBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  phpPackages,
  relativeWebBuildFolder,
} from "../project.conf";

makeJawisBuildManager(
  projectRoot,
  alphaBuildFolder,
  npmScope,
  scopedPackages,
  unscopedPackages,
  privatePackages,
  /* replacePathForRelease */ false,
  phpPackages
)
  .build()
  .then(() =>
    compileJawisFiles({
      buildFolder: alphaBuildFolder,
      keepSubFoldersInNodeBeesAndPlainFiles: true,
      relativeWebBuildFolder,
    })
  )
  .catch(console.log);
