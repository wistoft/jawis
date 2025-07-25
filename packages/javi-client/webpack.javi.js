const path = require("path");

const { createWebpackBaseConf   } = require("../misc/node/createWebpackBaseConf"); // prettier-ignore

//
// base conf
//

const baseWebpackConf = createWebpackBaseConf({
  tsConfigFile: path.join(__dirname, "tsconfig.json"),
});

//
// conf
//

module.exports = {
  ...baseWebpackConf,

  mode: "production",

  entry: {
    app: path.join(__dirname, "app.tsx"),
  },

  output: {
    publicPath: "/", // must be explicit because of reach router/HtmlWebpackPlugin
  },

  devtool: "source-map",
};
