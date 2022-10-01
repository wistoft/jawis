const path = require("path");

const {
  createWebpackBaseConf,
} = require("../../util-dev/node/createWebpackBaseConf");

const conf = require("../dev.conf");
const { getPackagePath } = require("../project.conf");

//
// base conf
//

const baseWebpackConf = createWebpackBaseConf({
  template: getPackagePath("javi-client/index.ejs"),
  tsConfigFile: path.join(__dirname, "../tsconfig.json"),
  defineHtml: {
    __pageTitle: "Dev",
    __conf_url: "http://localhost:" + conf.serverPort + "/conf.js",
  },
  define: {
    __DEV_CLIENT_CONF: JSON.stringify({
      serverPort: conf.serverPort,
      jagoConsolePortForDev: conf.jagoConsolePortForDev,
    }),
  },
});

//
// conf
//

module.exports = {
  ...baseWebpackConf,

  mode: "development",

  entry: {
    consoleCaptureMain: "@jawis/console/consoleCaptureMain.js",
    app: path.join(__dirname, "clientEntry.tsx"),
  },

  output: {
    publicPath: "/", // must be explicit because of reach router/HtmlWebpackPlugin
  },

  devtool: "inline-cheap-module-source-map",
  // devtool: "eval-cheap-module-source-map",
  devServer: {
    contentBase: "./dist",
    inline: false,
    port: conf.clientPort,
    historyApiFallback: true,
  },
};
//
