# Jadev

JavaScript development tools is a multirepo for several npm packages, for
intance:

- [Javi](https://github.com/wistoft/jadev/tree/master/packages/javi#readme). A
  GUI for running tests and scripts, with out of the box support for TypeScript.

## Development

### Clone

```
git clone git@github.com:wistoft/jadev.git

cd jadev

yarn
```

### Serve dev site

Jadev repo is setup to use javi to run tests and dev server. Webpack will serve
the dev client.

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

- `lerna publish from-package`

## Known issues

- It's developed on windows, and not tried elsewhere. Some things don't work,
  yet.
  - vscode tasks are configured to use `powershell.exe`

## Licence

MIT
