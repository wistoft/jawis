import path from "path";
import { webpackCompile, getNodeWebpackConf } from "^misc/node";

const projectConf = eval("require")("../../project.conf");

/**
 * Compile a ts-file with webpack to a single js-file
 *
 *
 * - Place output file in folder named: `compiled`
 */
export const webpackCompileHelper = (
  folder: string,
  file: string,
  outFolder = projectConf.publishBuildFolder
) => {
  const conf = getNodeWebpackConf({
    file: path.join(projectConf.packageFolder, folder, file + ".ts"),
    outPath: path.join(outFolder, folder, "compiled"),
    outFilename: file + ".js",
  });

  webpackCompile({ ...conf, devtool: "source-map" });
};
