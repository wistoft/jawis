# Jadev

JavaScript development tools is a multirepo for several npm packages, for
instance:

- [Javi](https://github.com/wistoft/jadev/tree/master/packages/javi#readme). A
  GUI for running tests and scripts, with out of the box support for TypeScript.

## Development

### Clone

```
git clone https://github.com/wistoft/jadev.git

cd jadev

yarn
```

Now it's posible to use the commands below.

### Run tests

Start javi

```
yarn start
```

Open in browser

```
localhost:3003/all
```

### Serve dev site

Jadev repo is setup to use javi to run tests and the dev server. Webpack will
serve the dev client.

- `yarn start`<br/> Serve using published version of javi.
- `yarn alpha:start`<br/> Serve using local alpha build of javi.

### Type error

To get type errors during development run the vscode task: `watch - jadev`. To
automatically start this task install the extentions: `AutoLaunch`

### Build

- `yarn alpha:build`<br/> Build a version, that can run locally without
  publishing to npm.
- `yarn pub:build`<br/> Build a version, that is ready for publishing to npm.

### Publish to npm

- Run all tests
- Commit working tree to git
- `yarn lint:fix`
  - Running the vscode tasks makes the errors available in vscode.
  - Review, because there's a bug, that removes comments after imports
- `yarn pretty:fix`
- Bump version number in `gulpfile.js`
- `yarn pub:build`
- `lerna publish from-package`

## Known issues

- vscode tasks are configured to use `powershell.exe`. Hence only work on
  Windows.
- There is a problem with ambiant types in builded `d.ts` files.

## Licence

MIT
