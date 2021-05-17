module.exports = {
  testFolder: "testsuite",
  removePathPrefix: "prefixToRemove",
  scriptFolders: ["scripts"],
  scripts: [
    {
      script: "scripts/hello.js",
      autoStart: true,
      autoRestart: true,
    },
  ],
};
