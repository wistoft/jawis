# Jawis

Jawis is a multirepo for several npm packages, for instance:

- [Javi](https://github.com/wistoft/jawis/tree/master/packages/javi#readme). A
  GUI for running tests and scripts, with out of the box support for TypeScript.

## Development

### Clone

```
git clone https://github.com/wistoft/jawis.git

cd jawis

yarn
```

Now it's possible to use the commands below.

### Run tests

Start javi

```
yarn start
```

Open in browser, and run all tests.

```
localhost:3003/all
```

### Serve dev site

Jawis repo is setup to use javi to run tests and the dev server. Webpack will
serve the dev client.

- `yarn start`<br/> Serve using published version of javi.
- `yarn alpha:start`<br/> Serve using local alpha build of javi.

### Type error

To get type errors during development run the vscode task: `watch`. To
automatically start this task install the extentions: `AutoLaunch`

### Build

- `yarn alpha:build`<br/> Build a version, that can run locally without
  publishing to npm.
- `yarn build`<br/> Build a version, that is ready for publishing to npm.

### Publish to npm

- Run all tests
- Commit working tree to git
- `yarn lint:fix`
  - Running the vscode tasks makes the errors available in vscode.
  - Review, because there's a bug, that removes comments after imports
- `yarn pretty:fix`
- Update change log.
- Bump version number in `gulpfile.js`
- `yarn build`
- `lerna publish from-package`
- Clean up git history and tag commit.

## Packages

- `dev` contains code useful just for development of jawis.
- `misc` has where things that don't fit anywhere, fit in.
- `javi` contains the 'mounts' for production/released javi.

### Naming conventions

- `jago` and `jate` have 3 parts: server, view and common. They are separated
  into their packages, denoted by the postfix chars. E.g. `s` in `jagos`.
- Packages prefixed `jab` have general usefulness outside jawis. Their postfix
  indicate what they are utilities for. E.g. `jab-express` contains utilities
  for [express framework](https://expressjs.com/). Another way to think of it,
  is that the postfix indicate which dependencies the package have.
- Packages prefixed `util` contain utilities useful specifically for jawis.

## Known issues

- Web socket in development sites reconnect too eager, and the browser is
  obliged to block further connections for a while. There's no feadback from the
  browser, that this happens.
- vscode tasks are configured to use `powershell.exe`. Hence only work on
  Windows.
- There is a problem with ambiant types in builded `d.ts` files.
- Minimal `node` version is `12.11.0`.

## Licence

MIT
