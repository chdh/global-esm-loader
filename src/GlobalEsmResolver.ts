// This module is needed because `module.require.resolve()`, which is used by "resolve-global", does
// not work when a package does not have the required "exports" in `package.json`.
// This is the case with "@rollup/plugin-alias" version >= 6.
// The error code is ERR_PACKAGE_PATH_NOT_EXPORTED.
// The second reason is that `import.meta.resolve()` cannot be used inside a custom loader.

import Fs from "node:fs";
import Path from "node:path";
import globalDirectory from "global-directory";
import {exports as resolveExports} from "resolve.exports";

function resolveInModulesPath (specifier: string, modulesPath: string) : string {
   const pkgDir = Path.join(modulesPath, specifier);
   const pkgJsonPath = Path.join(pkgDir, "package.json");
   const json = Fs.readFileSync(pkgJsonPath, 'utf8');
   const pkg = JSON.parse(json);
   const exp = resolveExports(pkg, '.', {
      require: false, // ESM
      browser: false, // for Node.js
   });
   if (!exp || !exp.length) {
      throw new Error(`No exports entry found for ESM in package.json of "${specifier}".`);
   }
   const rel = exp[0].replace(/^\.\//, '');
   return Path.join(pkgDir, rel); }

export function resolveGlobalEsm (specifier: string) : string {
   const globalModulesPaths = [globalDirectory.yarn.packages, globalDirectory.npm.packages]; // same as in "resolve-global"
   let finalErr: NodeJS.ErrnoException|undefined = undefined;
   for (const modulesPath of globalModulesPaths) {
      try {
         return resolveInModulesPath(specifier, modulesPath);
      } catch (err) {
         if (!finalErr || finalErr.code == "ENOENT") {
            finalErr = err;
         }
      }
   }
   throw <Error>finalErr;
}
