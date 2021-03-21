const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

/**
 * - explicit config file needed for tsconfig paths.
 */
const createWebpackBaseConf = ({
  template,
  tsConfigFile,
  define,
  defineHtml,
}) => {
  return {
    stats: "errors-only",

    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      plugins: [
        new TsconfigPathsPlugin({
          configFile: tsConfigFile,
        }),
      ],
    },

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: "ts-loader",
              options: {
                transpileOnly: true,
                configFile: tsConfigFile,
                compilerOptions: {
                  module: "esnext",
                  sourceMap: true,
                },
              },
            },
          ],
        },
        // All output '.js' files will have sourcemaps re-processed, to enforce consistency.
        {
          enforce: "pre",
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "source-map-loader",
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: ["file-loader"],
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template,
        ...defineHtml,
      }),
      new webpack.DefinePlugin(define || {}),
    ],
  };
};

module.exports = { createWebpackBaseConf };
