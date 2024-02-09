const path = require("path");

const {
  createWebpackBaseConf,
} = require("../../misc/node/createWebpackBaseConf");

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
    // consoleCaptureMain: "@jawis/console/consoleCaptureMain.js",
    app: path.join(__dirname, "clientEntry.tsx"),
    //quick fix
    ymer: getPackagePath("jabrov/ymer.ts"),
  },

  output: {
    publicPath: "/", // must be explicit because of reach router/HtmlWebpackPlugin
  },

  devtool: "inline-cheap-module-source-map",
  devServer: {
    port: conf.clientPort,
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
