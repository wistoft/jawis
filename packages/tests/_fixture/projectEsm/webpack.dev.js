import { dirname, join } from "path";
import { fileURLToPath } from "url";
import TerserPlugin from "terser-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  mode: "production",

  target: "node",

  entry: {
    // dynamic is a
    dynamicCjsFile: join(__dirname, "dynamicCjsFile.js"),
    dynamicJsFile: join(__dirname, "dynamicJsFile.js"),
    dynamicMjsFile: join(__dirname, "dynamicMjsFile.js"),
    // dynamicTsFile: join(__dirname, "dynamicTsFile.js"),

    importCjsFile: join(__dirname, "importCjsFile.js"),
    importJsFile: join(__dirname, "importJsFile.js"),
    importMjsFile: join(__dirname, "importMjsFile.js"),
    // importTsFile: join(__dirname, "importTsFile.js"),

    //used by dynamic exports in build folder

    // library1: join(__dirname, "library1.js"),
    // library2: join(__dirname, "library2.cjs"),
    // library3: join(__dirname, "library3.mjs"),
  },

  output: {
    path: join(__dirname, "build-webpack"),
  },

  optimization: {
    runtimeChunk: false,
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            beautify: true,
            comments: true,
          },
          module: true,
          compress: true,
          mangle: false,
          keep_classnames: true,
          keep_fnames: true,
        },
      }),
    ],
  },
};
