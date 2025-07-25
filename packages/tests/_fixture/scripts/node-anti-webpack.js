//throws if this is bundled by webpack

if (typeof __webpack_require__ !== "undefined") {
  throw new Error("webpack bundling detected");
} else {
  console.log("webpack not used here!");
}
