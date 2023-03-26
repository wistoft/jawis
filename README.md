# Jawis

Jawis is a multirepo for several npm packages, for instance:

- [Javi](https://github.com/wistoft/jawis/tree/master/packages/javi#readme). A
  GUI for running tests and scripts, with out of the box support for TypeScript.

## Development

### Clone

```
git clone git@github.com:wistoft/jawis.git

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

### Type errors

Type errors are shown during development by the vscode task: `watch`. It's
automatically started.

### Build

- `yarn alpha:build`<br/> Build a version, that can run locally without
  publishing to npm.
- `yarn build`<br/> Build a version, that is ready for publishing to npm.

### Publish to npm

- Run all tests
- `yarn lint:fix`
  - Running the vscode tasks makes the errors available in vscode.
- `yarn custom:fix`
- `yarn pretty:fix`
- `yarn build`
- Publish to npm manually in the folders below: `build/publish`

## Packages

- `dev` contains code used for development of jawis.
- `misc` where things, that don't fit anywhere, fit in.
- `javi` contains the 'mounts' for released javi.

### Naming conventions

- `jago` and `jate` have 3 parts: server, view and common. They are separated
  into their packages, denoted by the postfix chars. E.g. `s` in `jagos`.
- Packages prefixed `jab` have general usefulness outside jawis. Their postfix
  indicate what they are utilities for. E.g. `jab-express` contains utilities
  for [express framework](https://expressjs.com/). Another way to think of it,
  is that the postfix indicate which dependencies the package have.

## Known issues

- Web socket in development sites reconnect too eager, and the browser is
  obliged to block further connections for a while. There's no feadback from the
  browser, that this happens.
- vscode tasks are configured to use `powershell.exe`. Hence only work on
  Windows.
- There is a problem with ambiant types in built `d.ts` files.

## Licence

MIT
