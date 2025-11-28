# Global ESM Loader

A custom loader for Node.js that automatically loads globally installed ESM modules.

Node.js does not load global ESM modules by default.
It currently requires a custom Module Loader to bridge this gap.

This loader lets you import `foo` even when `foo` is only installed globally (e.g. via `npm install -g foo`),
This loader supports both ESM and CommonJS packages.

Global CommonJS packages could be loaded using `require()` by setting `NODE_PATH`.
However as more utility packages and their plugins transition to ESM-only distributions, this becomes impossible in some cases.

## Using the loader as a local package

In the example below, a globally installed `typescript` package is used as an example to show how to `import` a global package.
When calling Node.js, the `--import` option is used to pre-load the loader.


``` Batchfile
npm install --save-dev global-esm-loader
npm install -g typescript
node --import=global-esm-loader/register -e "import * as ts from 'typescript'; console.log(ts.version);"
```

## Using the loader as a global package

Example for Windows:

``` Batchfile
npm install -g global-esm-loader
npm install -g typescript
node --import "file://%APPDATA%/npm/node_modules/global-esm-loader/dist/Loader.js" -e "import * as ts from 'typescript'; console.log(ts.version);"
```

## Requirements

- Should work with Node.js >= v22.15, but has up to now only been tested with v24.11.
- Uses the [Node custom ESM loader hooks](https://nodejs.org/api/module.html#customization-hooks) (`--import`), which are still marked as experimental in Node.
