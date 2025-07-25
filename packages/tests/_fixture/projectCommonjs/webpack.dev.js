const path = require("path");

module.exports = {
  mode: "development",

  target: "node",

  entry: {
    dynamicCjsFile: path.join(__dirname, "dynamicCjsFile.js"),
    dynamicJsFile: path.join(__dirname, "dynamicJsFile.js"),
    dynamicMjsFile: path.join(__dirname, "dynamicMjsFile.js"),
    // dynamicTsFile: path.join(__dirname, "dynamicTsFile.js"),
    importCjsFile: path.join(__dirname, "importCjsFile.js"),
    importJsFile: path.join(__dirname, "importJsFile.js"),
    // importTsFile: path.join(__dirname, "importTsFile.js"),
  },

  output: {
    path: path.join(__dirname, "build-webpack"),
    // publicPath: "",
  },
};
