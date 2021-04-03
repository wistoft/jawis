import webpack from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

type Deps = {
  template?: string;
  tsConfigFile: string;
  define?: webpack.DefinePlugin["definitions"];
  defineHtml?: Record<string, any>;
};

/**
 * - explicit config file needed for tsconfig paths.
 *
 * note
 *  - HtmlWebpackPlugin has reserved keys, that are used to configure it. Mind that i `defineHtml`.
 */
export const createWebpackBaseConf = ({
  template,
  tsConfigFile,
  define,
  defineHtml,
}: Deps) => ({
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
      ...(defineHtml || {}),
    }),
    new webpack.DefinePlugin(define || {}),
  ],
});
