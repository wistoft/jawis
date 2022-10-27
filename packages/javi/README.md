# JavaScript View

A is tool for running test cases and scripts. Everything is presented in the
browser, so no CLI needed for running neither test cases nor scripts.

- TypeScript by default.
- Javi is intended to be agnostic to test framework. One could even use several.
  All test results are presented in the same view. However, it only suppports a
  new framework called [Jarun](https://www.npmjs.com/package/@jawis/jarun), for
  now.

## Installation

```
yarn add --dev @jawis/javi
```

or

```
npm i --save-dev @jawis/javi
```

## Usage

- Create a configuration file in the root of your project.
- Run `yarn javi` or `npm javi` depending on your installation.
- Open a browser at `http://localhost:3003`
- Explore how the view works.

### Example: Development server

- A development server is just a script. It's started and reloaded by javi, when
  source files change.
- Output and errors is shown in the browser. This for instance makes it easy to
  open stack frame in the editor.
- Output and errors can be shown on the development site, by using
  [JagoConsole](https://www.npmjs.com/package/@jawis/jagos)

## Configuration

Javi reads a configuration file from the working directory: `javi.conf.js`.

Example configuration file

```js
module.exports = {
  //Folder containing test cases.
  testFolder: "packages/tests",

  //Scripts in this folder can be executed in javi > scripts.
  scriptFolders: ["packages/dev/scripts/"],

  //Declaration of individual scripts
  scripts: [
    {
      script: "packages/dev/devServerMain.ts",
      autoStart: true,
      autoRestart: true,
    },
  ],
};
```

Default configuration (When nothing else specified)

```js
module.exports = {
  testFolder: ".",
  //The place test logs are stored.
  testLogFolder: "./_testLogs",
  //The javi is served from.
  port: "3003",
  //timeout in `TestExecutionController`.
  tecTimeout: 30000,
  //This prefix is removed in stack traces.
  //It's relative to position of configuration file.
  removePathPrefix: "",
  scriptFolders: ["."],
  scripts: [],
};
```

## How it works

- [Jacs](https://www.npmjs.com/package/@jawis/jacs) is used to transpile
  TypeScript for both test cases and scripts. It transpiles and caches results
  in the same process javi runs in. When a new worker thread starts, it receives
  the cached source files through shared memory.
- Changes in test files or files they import are detected by
  [WatchableProcess](https://www.npmjs.com/package/@jawis/jab-node). Javi kills
  processes with old code, and restarts executing test cases, so test results
  are always from a consistent codebase. I.e. it's guaranteed that no file used
  by the test case changed during execution.

## Limitations

- Test cases must be placed in a separate folder. Tests in subfolders are
  included. Subfolders prefixed `_` are ignored.
- TypeScript is only transpiled. This could be viewed as beneficial, actually.
  Because one can execute code with type errors. That's useful some times.
  - It's beneficial the make a
    [vscode task](https://code.visualstudio.com/docs/editor/tasks#_typescript-hello-world)
    to compile TypeScript, and show errors in vscode. A vscode task is the best
    way to get type errors, because they are reported where they occur in source
    code.
- Everything happens in
  [Worker Threads](https://nodejs.org/api/worker_threads.html), because it's
  hard to get cached transpile results efficiently into another process.

## Known issues

- The configuration can't be in TypeScript.
- Open files from browser is hardcoded to vscode. On windows.
- Open files for merge is hardcoded to WinMerge.
- Test paths are ignored. So 'path/test.ja.js' has same test log file as
  'other/path/test.ja.js'
- Output from scripts can only be shown in the view. Opt-in to show it in the
  same console as javi runs, would be great.
- TypeScript is fixed to a certain version. It should be a peer dependency,
  instead.

## Future work

- Make it possible to use other testing frameworks.
- Make posible to run script and tests in the browser.

## Related work

maybe

- [nof5](https://www.npmjs.com/package/nof5)

## License

MIT
