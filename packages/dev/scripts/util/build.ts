import path from "path";
import { webpackCompile, getNodepackConf, getWebpackConf } from "^misc/node";
import webpack from "webpack";

const projectConf = eval("require")("../../../../project.conf");

/**
 *
 */
export const nodepackHelper_new = ({
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
export const webpackHelper_new = ({
  folder,
  file,
  outPath,
  outFilename,
}: {
  folder: string;
  file: string;
  outPath: string;
  outFilename?: string;
}) =>
  webpackCompile(
    getWebpackConf({
      file: path.join(projectConf.packageFolder, folder, file + ".ts"),
      outPath,
      outFilename: outFilename || file + ".js",
    })
  );

/**
 *
 */
export const nodepackHelper = (
  folder: string,
  file: string,
  outFolder = projectConf.publishBuildFolder
) =>
  webpackCompile(
    getNodepackConf({
      file: path.join(projectConf.packageFolder, folder, file + ".ts"),
      outPath: path.join(outFolder, folder, "compiled"),
      outFilename: file + ".js",
    })
  );

/**
 *
 * quick fix
 *  - always output to javi folder.
 */
export const webpackHelper = (
  folder: string,
  file: string,
  outFolder = projectConf.publishBuildFolder
) =>
  webpackCompile(
    getWebpackConf({
      file: path.join(projectConf.packageFolder, folder, file + ".ts"),
      outPath: path.join(outFolder, "javi", "client"),
      outFilename: file + ".js",
    })
  );
