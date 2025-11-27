import * as Module from 'node:module';
import {pathToFileURL} from 'node:url';
import globalDirectory from "global-directory";
import {resolveGlobal} from "resolve-global";
import {resolveGlobalEsm} from "./GlobalEsmResolver.ts";

const debugLevel = 0;

export function displayInfo() {
   console.log("yarn packages: " + globalDirectory.yarn.packages);
   console.log("npm packages: " + globalDirectory.npm.packages);
   console.log("Import.meta.url: " + import.meta.url);
}

function isBareSpecifier (s: string) {
   return (
     !s.startsWith('.') &&
     !s.startsWith('/') &&
     !s.includes(':') );
}

function resolve (specifier: string, context: Module.ResolveHookContext, nextResolve: Function) : Module.ResolveFnOutput {
   if (debugLevel > 0) {
      console.log("--- resolve ---");
      console.log("specifier: " + specifier);
      console.log("parentURL: " + context.parentURL);
   }

   // Try the default resolver.
   let originalError: Error | undefined;                                       // original error of the default resolver
   try {
      const res = nextResolve(specifier, context);
      if (debugLevel > 0) {
         console.log("Default resolver result: ", res);
      }
      return res;
   } catch (err: any) {
      if (err?.code === "ERR_MODULE_NOT_FOUND" && isBareSpecifier(specifier)) {
        originalError = err;
      } else {
        throw err;
      }
   }

   // Try the default resolver with the parent path of this loader module.
   // This works when this loader module and the target module are installed in the same global directory.
   try {
      const context2 = {...context, parentURL: import.meta.url};
      const res = nextResolve(specifier, context2);
      if (debugLevel > 0) {
         console.log("Default resolver result with loader parent URL: ", res);
      }
      return res;
   } catch (err) {
      if (debugLevel > 0) {
         console.log("Error from default resolver with loader parent URL: " + err);
      }
   }

   // Try the "resolve-global" module.
   try {
      const path = resolveGlobal(specifier);
      if (debugLevel > 0) {
         console.log("resolveGlobal() path: " + path);
      }
      if (path) {
         const url = pathToFileURL(path).href;
         return {url, shortCircuit: true};
      }
   } catch (err) {
      if (debugLevel > 0) {
         console.log("Error from resolveGlobal(): " + err);
      }
   }

   // Try our own global ESM resolver.
   try {
      const path = resolveGlobalEsm(specifier);
      if (debugLevel > 0) {
         console.log("resolveGlobalEsm() path: " + path);
      }
      const url = pathToFileURL(path).href;
      return {url, shortCircuit: true};
   } catch (err) {
      if (debugLevel > 0) {
         console.log("Error from resolveGlobalEsm(): " + err);
      }
   }

   // Throw the original error from the default resolver.
   throw originalError!;
}

function startup() {
   if (debugLevel > 0) {
      console.log("--- startup ---");
      displayInfo();
   }
   Module.registerHooks({resolve});
}

startup();
