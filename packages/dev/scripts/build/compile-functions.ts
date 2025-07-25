import path from "node:path";
import webpack from "webpack";
import { getBeePreloaderMainDeclaration } from "^bee-common/BeePreloaderMain";
import { beeConfMainDeclaration } from "^bee-node";
import { consoleCaptureMainDeclaration } from "^console/internal";
import { ymerMainDeclaration } from "^jabrov/ymer";
import { jacsConsumerMainDeclaration } from "^jacs";
import { scriptWrapperMainDeclaration } from "^jagos/internal";
import { jarunProcessMainDeclaration } from "^jarunc/internal";
import {
  jabWorkerMainDeclaration,
  watchableProcessMainDeclaration,
} from "^process-util/internal";

import { makeCompileFunctions } from "./compile-functions-util";
import {
  buildPhasic,
  buildPhpFilesSync,
  convertPhpFilesInBuildFolder,
  dumpAutoloadFile,
  dumpAutoloadFiles,
} from ".";

/**
 *
 *
 */
export const compileJawisFiles = async (deps: {
  buildFolder: string;
  relativeWebBuildFolder: string;
  keepSubFoldersInNodeBeesAndPlainFiles: boolean;
  externals?: webpack.Configuration["externals"];
}) => {
  const prov = makeCompileFunctions({
    webBuildFolder: path.join(deps.buildFolder, deps.relativeWebBuildFolder),
    ...deps,
  });

  //
  // compile
  //

  await prov.compile(jacsConsumerMainDeclaration);
  await prov.compile(jarunProcessMainDeclaration);
  await prov.compile(getBeePreloaderMainDeclaration());
  await prov.compile(watchableProcessMainDeclaration);
  await prov.compile(beeConfMainDeclaration);
  await prov.compile(scriptWrapperMainDeclaration);

  //todo: these should be placed in their folders, and javi can fetch/serve them from there.
  await prov.compile(ymerMainDeclaration);
  await prov.compile(consoleCaptureMainDeclaration);

  await prov.compile(jabWorkerMainDeclaration);

  // php

  await buildPhasic(deps);

  buildPhpFilesSync({ ...deps, packageName: "jate-behat" });
  buildPhpFilesSync({ ...deps, packageName: "jate-php-unit" });
  buildPhpFilesSync({ ...deps, packageName: "bee-php" });

  await convertPhpFilesInBuildFolder(deps); //todo: should probably be done by individual copy functions.

  await dumpAutoloadFiles(deps);
  await dumpAutoloadFile(deps);

  return prov;
};
