# Global ESM Loader

A custom loader for Node.js that automatically loads globally installed ESM modules.

Node.js does not load global ESM modules by default.
Tt currently requires a custom Module Loader to bridge this gap.

Global CommonJS packages could be loaded using `require()` by setting `NODE_PATH`.
But as more and more utility packages and their plugins switch to ESM-only distributions, this is no longer possible.

This loader handles both ESM and CommonJS global packages (CJS interop).

## Using the loader as a local package

In the example below, a globally installed `typescript` package is used as an example to show how to `import` a global package.
When calling Node.js, the `--import` option is used to pre-load the loader.


``` Batchfile
npm install --save-dev global-esm-loader
npm install -g typescript
node --import=./node_modules/global-esm-loader/dist/Loader.js -e "import * as ts from 'typescript'; console.log(ts.version);"
```

## Using the loader as a global package

Example for Windows:

``` Batchfile
npm install -g global-esm-loader
npm install -g typescript
node --import=file://%appdata%/npm/node_modules/global-esm-loader/dist/Loader.js -e "import * as ts from 'typescript'; console.log(ts.version);"
```
