const path = require("path");

const {
  createWebpackBaseConf,
} = require("../../misc/node/createWebpackBaseConf");

const { webpackPort, packageFolder } = require("../project.conf");

//
// base conf
//

const baseWebpackConf = createWebpackBaseConf({
  tsConfigFile: path.join(__dirname, "../tsconfig.json"),
});

//
// conf
//

module.exports = {
  ...baseWebpackConf,

  mode: "development",

  entry: {
    app: path.join(__dirname, "clientEntry.tsx"),

    consoleBooterMain: path.join(
      packageFolder,
      "log-server",
      "consoleBooterMain.tsx"
    ),
  },

  output: {
    publicPath: "/", // must be explicit because of reach router/HtmlWebpackPlugin
  },

  devtool: "inline-cheap-module-source-map",
  devServer: {
    port: webpackPort,
    historyApiFallback: true,
    hot: false,
    liveReload: false,
    client: {
      logging: "none",
      overlay: false,
      reconnect: false,
    },
  },
};
