import mod from "path-browserify";

require.extensions[".dummy"] = () => {};

console.log(require.extensions);

require("./hello"); //literal require is bundled

//clear cache - will ensure require below isn't cached, when test is rerun.

Object.keys(require.cache).forEach((key) => {
  delete require.cache[key];
});

//non-literal require is not bundled, but left to normal nodejs.

require(__dirname + "/../scripts/node-anti-webpack");

//npm protocol works in emitted code

if (mod === undefined) {
  throw new Error("mod should have been imported");
}

console.log("npm protocol works");
