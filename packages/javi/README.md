# @jawis/javi

JavaScript View is tool for running test cases and scripts. Everything is
presented in the browser, so no CLI needed for running neither test cases nor
scripts.

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

### Development server

- A development server is just a script. It's started and reloaded by javi, when
  source files change.
- Output and errors from the server can be shown on the development site, by
  using [JagoConsole](https://www.npmjs.com/package/@jawis/jagos)

## Configuration

Javi reads a configuration file from the working directory: `javi.conf.js`.

Example configuration file

```js
module.exports = {
  //Folder containing test cases.
  testFolder: "packages/tests",

  //This prefix is removed in stack traces.
  //It's relative to position of configuration file.
  removePathPrefix: "packages",

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

## How it works

- [Jacs](https://www.npmjs.com/package/@jawis/jacs) is used to transpile
  TypeScript for both test cases and scripts. It transpiles and caches results
  in the same process javi runs in. When a new worker thread starts, it can
  receive the cached source files through shared memory.
- Changes in test files or files they import are detected by
  [WatchableProcess](https://www.npmjs.com/package/@jawis/jab-node). Javi kills
  processes with old code, and restarts executing test cases, so test results
  are always from running on a consistent codebase. I.e. it's guaranteed that no
  file used by the test case changed during execution.

## Limitations

- Test cases must be placed in a separate folder. Tests in subfolders are
  included. subfolders prefixed `_` are ignored.
- TypeScript is only be transpiled. This could be viewed as beneficial,
  actually. Because one can execute test cases, even if there are type errors.
  That's useful some times.
  - It's beneficial the make a
    [vscode task](https://code.visualstudio.com/docs/editor/tasks#_typescript-hello-world)
    to compile TypeScript, and show errors in vscode. A vscode task is the best
    way to get type errors, because they are reported where they occur in source
    code.
- Everything happens in
  [Worker Threads](https://nodejs.org/api/worker_threads.html), because it's
  hard to get cached transpile results efficiently into another process.

## Known issues

- The configuration can't be in TypeScript, yet.
- List of scripts are not updated, when scripts are added/deleted. And
  subfolders in script folders are handled buggy.
- Open files from browser is hardcoded to vscode. On windows.
- Open files for merge is hardcoded to WinMerge.
- Test paths are ignored. So 'path/test.ja.js' has same test log file as
  'other/path/test.ja.js'

## Future work

- Make it possible to use other testing frameworks.

## License

MIT
