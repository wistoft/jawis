module.exports = {
  testFolder: "packages/tests",
  removePathPrefix: "packages",
  scriptFolders: ["packages/dev/scripts/"],
  scripts: [
    {
      script: "packages/dev/devServer/devServerMain.ts",
      autoStart: true,
      autoRestart: true,
    },
    {
      script: "packages/dev/devServer/devJaviTestMain.ts",
    },
  ],
};
