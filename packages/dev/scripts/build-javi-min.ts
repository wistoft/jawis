import fs from "node:fs";
import path from "node:path";
import del from "del";

import { makeCapturingNodeExternals } from "^pack-util";

import {
  projectRoot,
  packageFolder,
  javiMinBuildFolder,
} from "../project.conf";
import { compileJawisFiles } from "./build";
import {
  PHPUnitAdapterBootstrapDeclaration,
  PHPUnitAdapterGetTestFilesDeclaration,
} from "^jate-php-unit";
import { assertAbsolute } from "^jab-node";

(async () => {
  //
  // delete build folder
  //

  await del([javiMinBuildFolder], {
    force: true,
  });

  //
  // start
  //

  const packageJsonFile = assertAbsolute(
    path.join(projectRoot, "package.json")
  );

  const capture = makeCapturingNodeExternals(packageJsonFile);

  const prov = await compileJawisFiles({
    buildFolder: javiMinBuildFolder,
    keepSubFoldersInNodeBeesAndPlainFiles: false,
    relativeWebBuildFolder: "client",
    externals: capture.externals,
  });

  //
  // compile extra for javi min
  //

  await prov.compileNodeEntryFile("javi", "javiServerMain", "jm.js");
  await prov.compileNodeEntryFile("stdio-filter", "console-filter-main", "cf.js"); // prettier-ignore
  await prov.compileNodeEntryFile("stdio-filter", "console-filter-main-new", "cf-new.js"); // prettier-ignore

  await prov.compile(PHPUnitAdapterGetTestFilesDeclaration);
  await prov.compile(PHPUnitAdapterBootstrapDeclaration);

  //
  // add dependencies, that are overlooked by only looking at require.
  //

  capture.onExternals({
    request: "ts-loader",
    context: path.join(packageFolder, "pack-util/util.ts"),
  });

  capture.onExternals({
    request: "source-map-loader",
    context: path.join(packageFolder, "pack-util/util.ts"),
  });

  //
  // make package.json
  //

  capture.writePackageJson(javiMinBuildFolder, "javi-min");
})();
