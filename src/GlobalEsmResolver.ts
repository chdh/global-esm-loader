// This module is needed because `module.require.resolve()`, which is used by "resolve-global", does
// not work when a package does not have the required "exports" in `package.json`.
// This is the case with "@rollup/plugin-alias" version >= 6.
// The error code is ERR_PACKAGE_PATH_NOT_EXPORTED.
// The second reason is that `import.meta.resolve()` cannot be used inside a custom loader.

import Fs from "node:fs";
import Path from "node:path";
import globalDirectory from "global-directory";
import * as ResolveExports from "resolve.exports";

function resolveInModulesPath (specifier: string, modulesPath: string) : string {
   const pkgDir = Path.join(modulesPath, specifier);
   const pkgJsonPath = Path.join(pkgDir, "package.json");
   const json = Fs.readFileSync(pkgJsonPath, 'utf8');
   const pkg = JSON.parse(json);

   // Try modern "exports" entries in package.json.
   const exp = ResolveExports.exports(pkg, '.', {
      require: false, // ESM
      browser: false, // for Node.js
   });
   if (exp?.length) {
      const rel = exp[0].replace(/^\.\//, '');
      return Path.join(pkgDir, rel);
   }

   // Fallback to legacy "main" / "module" entries.
   const legacyRel = ResolveExports.legacy(pkg);
   if (legacyRel && typeof legacyRel == 'string') {
      const rel = legacyRel.replace(/^\.\//, '');
      return Path.join(pkgDir, rel);
   }

   throw new Error(`No exports or main/module entries found for ESM in package.json of "${specifier}".`);
   }

export function resolveGlobalEsm (specifier: string) : string {
   const globalModulesPaths = [globalDirectory.yarn.packages, globalDirectory.npm.packages]; // same as in "resolve-global"
   let finalErr: NodeJS.ErrnoException|undefined = undefined;
   for (const modulesPath of globalModulesPaths) {
      if (!modulesPath) {
         continue;
      }
      try {
         return resolveInModulesPath(specifier, modulesPath);
      } catch (err: any) {
         if (!finalErr || finalErr.code == "ENOENT") {
            finalErr = err;
         }
      }
   }
   if (finalErr) {
      throw <Error>finalErr;
   }
   throw new Error(`Unable to resolve global package "${specifier}" because no global module paths were found.`);
}
