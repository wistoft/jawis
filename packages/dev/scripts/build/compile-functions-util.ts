import fs from "node:fs";
import path, { basename } from "node:path";
import webpack from "webpack";
import { assertEq, err } from "^jab/error";
import { assertNever } from "^jab/util";
import { DefaultCompiledFolder, MainFileDeclaration } from "^jabc/internal";

import {
  webpackCompile,
  getNodepackConf,
  getWebpackConf,
  makeCapturingNodeExternals,
} from "^pack-util";

import * as projectConf from "../../project.conf";

/**
 *
 */
export const makeCompileFunctions = (deps: {
  buildFolder: string;
  webBuildFolder: string;
  keepSubFoldersInNodeBeesAndPlainFiles: boolean;
  externals?: webpack.Configuration["externals"];
}) => {
  // general

  const prov = makeNodeCompile(deps.buildFolder, deps.externals);
  const prov2 = makeWebCompile(deps.webBuildFolder);

  // based on main file declarations

  const compile = (decl: MainFileDeclaration) => {
    const subfolderInPackageFolder = path.relative(
      projectConf.packageFolder,
      decl.folder
    );

    switch (decl.type) {
      case "web-module":
        return prov2.compileWebModule(subfolderInPackageFolder, decl.file);

      case "web-entry":
        return prov2.compileWebEntryFile(subfolderInPackageFolder, decl.file);

      case "pure-bee":
      //todo: compile pure-bee and throw if node imports are used.
      case "node-bee":
        return prov.compileNodeBeeFile(
          subfolderInPackageFolder,
          decl.file,
          deps.keepSubFoldersInNodeBeesAndPlainFiles
        );

      case "plain-file": {
        const outPath = deps.keepSubFoldersInNodeBeesAndPlainFiles
          ? path.join(deps.buildFolder, subfolderInPackageFolder)
          : path.join(deps.buildFolder);

        return fs.promises.copyFile(
          path.join(decl.folder, decl.file),
          path.join(outPath, decl.file)
        );
      }

      default:
        return assertNever(decl.type);
    }
  };

  //return

  return { ...prov, ...prov2, compile };
};

/**
 *
 */
export const makeNodeCompile = (
  buildFolder: string,
  externals?: webpack.Configuration["externals"]
) => ({
  compileNodeBeeFile: (
    folder: string,
    file: string,
    keepSubFolder: boolean
  ) => {
    const outPath = keepSubFolder
      ? path.join(buildFolder, folder, DefaultCompiledFolder)
      : path.join(buildFolder, DefaultCompiledFolder);

    return jawisNodepack({
      folder,
      file,
      outPath,
      externals,
    });
  },
  compileNodeEntryFile: (folder: string, file: string, outFilename: string) =>
    jawisNodepack({
      folder,
      file,
      outPath: buildFolder,
      outFilename,
      externals,
    }),
});

export const makeWebCompile = (webBuildFolder: string) => {
  const library = {
    name: "QUICK_FIX_EXPORT",
    type: "assign",
  };

  return {
    compileWebModule: (folder: string, file: string) =>
      jawisWebpack({
        folder,
        file,
        outPath: webBuildFolder,
        library,
      }),
    compileWebEntryFile: (folder: string, file: string) =>
      jawisWebpack({
        folder,
        file,
        outPath: webBuildFolder,
      }),
  };
};

/**
 *
 */
export const jawisNodepack = ({
  folder,
  file,
  outPath,
  outFilename,
  externals,
}: {
  folder: string;
  file: string;
  outPath: string;
  outFilename?: string;
  externals?: webpack.Configuration["externals"];
}) =>
  webpackCompile(
    getNodepackConf({
      file: path.join(projectConf.packageFolder, folder, file + ".ts"),
      outPath,
      outFilename: outFilename || file + ".js",
      externals,
    })
  );

/**
 *
 */
export const jawisWebpack = ({
  folder,
  file,
  outPath,
  outFilename,
  library = undefined,
}: {
  folder: string;
  file: string;
  outPath: string;
  outFilename?: string;
  library?: any;
}) =>
  webpackCompile(
    getWebpackConf({
      file: path.join(projectConf.packageFolder, folder, file + ".ts"),
      outPath,
      outFilename: outFilename || file + ".js",
      library,
    })
  );
