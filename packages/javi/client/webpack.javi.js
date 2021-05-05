const path = require("path");

const { createWebpackBaseConf,} = require("../../jawis-util/node/createWebpackBaseConf"); // prettier-ignore

const { getPackagePath } = eval("require")("../../../project.conf");

//
// base conf
//

const baseWebpackConf = createWebpackBaseConf({
  template: path.join(__dirname, "index.ejs"),
  tsConfigFile: path.join(__dirname, "../tsconfig.json"),
  defineHtml: {
    __pageTitle: "Javi",
    __conf_url: "/conf.js", // so the client loads this configuration files.
  },
});

//
// conf
//

module.exports = {
  ...baseWebpackConf,

  mode: "production",

  entry: {
    app: getPackagePath("javi/client/app.tsx"),
  },

  output: {
    publicPath: "/", // must be explicit because of reach router/HtmlWebpackPlugin
  },

  devtool: "source-map",
};
