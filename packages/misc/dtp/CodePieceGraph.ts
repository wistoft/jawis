import { assert, assertNever, err } from "^jab";
import { dfs } from "^assorted-algorithms";

import { DependencyInfo, ReExport } from "./internal";

/**
 * - Holds the graph for dtp algorithm.
 * - Implements getDirectImpact(), that is abstract to the algorithm.
 * - receives data from the parser. I.e. receives imports/exports.
 *
 * variable graph
 *  - a super graph of code piece graph
 *  - variable@absFile denotes external scope. I.e. exported code piece.
 *  - variable#absfile denotes internal scope. I.e. imported variable or declared code piece.
 *  - internal dependencies are tracked in variable as named code pieces. Just like external dependencies (imports). They share
 *      the same module name space.
 *
 * namespace graph
 *  - namespace imports are registered in separate graph, because traversal should be performed for every code piece, current
 *      and future. There's no way to emunerate it as a specific named imports.
 * 
 * reexport graph
 *      - needs it's own graph, because thees't not introduced any names into the module, so a ns import can't be used to simulate it.
 * 
 * export/import types
 *  - named import
 *  - namespace import
 *  - named export
 *      - can be imported or declared in module
 *  - named reexport
 *  - reexport all
 *  - reexport namespace
 
 *
 * optimization
 *  - if we consider all pieces dirty, when a file change, we will save at lot of parse/read time, and deliver impact faster.
 *     It's possible, because in impacted files the specificity is on piece level again.
 *
 * note
 *  - module scope consists of the names included and names declared in the file. These can be exported by name.
 *  - reexport can't be used internally, so they can use same names as in module scope, without name clash.
 */
export class CodePieceGraph {
  // variable => variables
  private variableDeps = new Map<string, Set<string>>();
  private variableImpact = new Map<string, Set<string>>();

  //for both import and reexport
  // variable => file
  public nameSpaceDeps = new Map<string, string>();
  // file => variables (which are imports/reexports)
  private nameSpaceImpact = new Map<string, Set<string>>();

  // file => file
  public reExportAllDeps = new Map<string, Set<string>>();
  // file => files
  public reExportAllImpact = new Map<string, Set<string>>();

  /**
   *
   */
  public getDirectDepsRaw = (id: string) => {
    return this.variableDeps.get(id);

    //todo: the other graphs too.
  };

  /**
   *
   */
  public getDirectImpact = (variable: string, file: string) => {
    const a = this.variableImpact.get(variable + "#" + file);
    const b = this.getNamespaceImpact(file);
    const c = this.getReExportAllImpact(variable, file);

    //collect

    const res = new Set<string>(c);

    if (a) {
      a.forEach((v) => {
        res.add(v);
      });
    }

    if (b) {
      b.forEach((v) => {
        res.add(v);
      });
    }

    return res;
  };

  /**
   *
   */
  public getCodePieceImpact = (variable: string) => {
    return this.variableImpact.get(variable);
  };

  /**
   *
   */
  public getNamespaceImpact = (file: string) => {
    return this.nameSpaceImpact.get(file);
  };

  /**
   * Given an exported variable, return the impacted variables based on the reexport all graph.
   */
  public getReExportAllImpact = (variable: string, file: string) => {
    //DFS in the reexport graph.

    const files = dfs(file, (id) => this.reExportAllImpact.get(id));

    //emit a `virtual` variable, as if it was exported from those files.

    return Array.from(files.values()).map(
      (impactedFile) => variable + "@" + impactedFile
    );
  };

  //
  // for contructing/updating
  //

  /**
   *
   */
  public addVariable = (
    file: string,
    name: string,
    type: "#" | "@",
    depFile: string,
    deps: string[],
    depType: "#" | "@"
  ) => {
    this.addVariableDependence(file, name, type, depFile, deps, depType);

    deps.forEach((depName) => {
      this.addVariableImpact(file, name, type, depFile, depName, depType) // prettier-ignore
    });
  };

  /**
   *
   */
  public addVariableDependence = (
    file: string,
    name: string,
    type: "#" | "@",
    depFile: string,
    deps: string[],
    depType: "#" | "@"
  ) => {
    const id = name + type + file;

    if (this.variableDeps.has(id)) {
      err("not impl. there was already a code piece.");
    }

    const mappedDeps = new Set<string>();

    deps.forEach((depName) => {
      mappedDeps.add(depName + depType + depFile);
    });

    this.variableDeps.set(id, mappedDeps);
  };

  /**
   *
   */
  public addVariableImpact = (
    file: string,
    name: string,
    type: "#" | "@",
    depFile: string,
    depName: string,
    depType: "#" | "@"
  ) => {
    const id = name + type + file;
    const depId = depName + depType + depFile;

    let entry = this.variableImpact.get(depId);

    if (!entry) {
      entry = new Set();
      this.variableImpact.set(depId, entry);
    }

    entry.add(id);
  };

  /**
   *
   */
  public addNsImportOrReExport = (
    file: string,
    name: string,
    importedFile: string,
    isReExport: boolean
  ) => {
    const id = name + (isReExport ? "@" : "#") + file;

    if (this.nameSpaceDeps.has(id)) {
      err("not impl. there was already a code piece.");
    }

    //add to dep

    this.nameSpaceDeps.set(id, importedFile);

    //add to impact

    let entry = this.nameSpaceImpact.get(importedFile);

    if (!entry) {
      entry = new Set();
      this.nameSpaceImpact.set(importedFile, entry);
    }

    entry.add(id);
  };

  /**
   *
   */
  public addReExportAll = (file: string, importedFile: string) => {
    if (this.reExportAllDeps.has(file)) {
      err("not impl. there was already a dependency.");
    }

    //add to dep

    let depEntry = this.reExportAllDeps.get(file);

    if (!depEntry) {
      depEntry = new Set();
      this.reExportAllDeps.set(file, depEntry);
    }

    depEntry.add(importedFile);

    //add to impact

    let entry = this.reExportAllImpact.get(importedFile);

    if (!entry) {
      entry = new Set();
      this.reExportAllImpact.set(importedFile, entry);
    }

    entry.add(file);
  };

  /**
   * traverses the output from the parser, and updates the graph.
   */
  public addInfo = (arr: DependencyInfo[], file: string) => {
    for (const entry of arr) {
      switch (entry.type) {
        case "internal":
          entry.data.forEach((cp) => {
            this.addVariable(file, cp.name, "#", file, cp.deps, "#");
          });
          continue;

        case "import":
          if (entry.nsAlias) {
            this.addNsImportOrReExport(file, entry.nsAlias, entry.file, false);
          }

          entry.named?.forEach((cp) => {
            this.addVariable(file, cp.name, "#", entry.file, cp.deps, "@");
          });
          continue;

        case "reexport":
          this.traverseReExport(entry, file);
          continue;

        case "export":
          entry.data.forEach((cp) => {
            this.addVariable(file, cp.name, "@", file, cp.deps, "#");
          });
          continue;

        case "main":
          // we need to collate main code, otherwise will dtp degrade to module level dtp.
          // not supported because we support pieces, that are computed. It should be enough.
          throw err("main code not supported.");

        default:
          return assertNever(entry);
      }
    }
  };

  /**
   * Reexport only introduces external variables. And only has external variables as dependencies.
   */
  private traverseReExport = (info: ReExport, file: string) => {
    if (info.data === "all") {
      this.addReExportAll(file, info.file);
      return;
    }

    if ("nsAlias" in info.data) {
      this.addNsImportOrReExport(file, info.data.nsAlias, info.file, true);
      return;
    }

    //named code pieces

    info.data.forEach((v) => {
      //needed for now
      assert(v.deps.length === 1);

      this.addVariableDependence(file, v.name,  "@", info.file,v.deps, "@") // prettier-ignore

      this.addVariableImpact(file, v.name, "@", info.file, v.deps[0], "@");
    });
  };
}
