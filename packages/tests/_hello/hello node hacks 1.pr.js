const nativeModule = require("module");

require.extensions[".js"] = (m, file) => {
  console.log("m.filename: ", m.filename);
  console.log("file: ", file);
  return "dav";
};

require("../_fixture/scripts/hello.js");

console.log("_pathCache: ", nativeModule._pathCache);
console.log(module);
