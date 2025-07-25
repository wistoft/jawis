import { AbsoluteFile, emitVsCodeError } from "^jab";
import {
  Plugin,
  DiagnosticWithoutFile,
  FullProjectFilesystemProv,
  PluginConstructor,
  PluginProv,
  makePluginDeps,
} from "./internal";

export type LintManagerDeps = {
  plugins: PluginConstructor[];
  projectFilesystem: FullProjectFilesystemProv;
  debug?: () => void;
};

/**
 *
 */
export class LintManager {
  private pluginDeps: PluginProv;
  private plugins: Plugin[];

  /**
   *
   */
  constructor(private deps: LintManagerDeps) {
    this.pluginDeps = makePluginDeps({
      ...deps,
      rootFolder: deps.projectFilesystem.getRootFolder(),
    });

    this.plugins = deps.plugins.map((pluginConstructor) =>
      pluginConstructor(this.pluginDeps)
    );
  }

  /**
   *
   */
  public getDiagnostics = async (file: AbsoluteFile) => {
    const content = await this.deps.projectFilesystem.readFile(file);

    let res: DiagnosticWithoutFile[] = [];

    for (const linter of this.plugins) {
      if (!linter.getDiagnostics) {
        continue;
      }

      res = res.concat(linter.getDiagnostics(content, file));
    }

    return res;
  };

  /**
   *
   */
  public getAutofixes = async (file: AbsoluteFile) => {
    let res = await this.deps.projectFilesystem.readFile(file);

    for (const linter of this.plugins) {
      if (!linter.mapFile) {
        continue;
      }
      res = await linter.mapFile(res);
    }

    return res;
  };

  /**
   *
   */
  public start = async () => {
    console.log("linting...");

    let allFiles: AbsoluteFile[] = [];

    //get new files and watch

    for (const linter of this.plugins) {
      const files = await this.getFiles(linter);

      for (const file of files) {
        this.deps.projectFilesystem.watchFile(file);
      }

      allFiles = allFiles.concat(files);
    }

    //process all files

    for (const file of allFiles) {
      await this.handleFile(file);
    }

    //done

    console.log("done");
  };

  /**
   *
   */
  private handleFile = async (file: AbsoluteFile) => {
    let res = await this.deps.projectFilesystem.readFile(file);

    //fix

    for (const linter of this.plugins) {
      if (!linter.mapFile) {
        continue;
      }
      res = await linter.mapFile(res);
    }

    //lint

    for (const linter of this.plugins) {
      if (!linter.getDiagnostics) {
        continue;
      }

      const diags = linter.getDiagnostics(res, file);

      diags.forEach((diag) => {
        emitVsCodeError({ ...diag, file });
      });
    }

    //write

    if (res === (await this.deps.projectFilesystem.readFile(file))) {
      return;
    }

    await this.deps.projectFilesystem.writeFile(file, res);
  };

  /**
   *
   */
  private getFiles = async (plugin: Plugin) => {
    //explicit files

    let files = (await plugin.getFiles?.()) ?? [];

    // files by pattern

    if (plugin.includeFile) {
      let files2 = this.pluginDeps.getAbsoluteFilesInGit();

      //quick fix
      files2 = files2.filter((file) => {
        return file
          .replace(/\\/g, "/")
          .startsWith(this.deps.projectFilesystem.getRootFolder());
      });

      files2 = files2.filter((file) => plugin.includeFile?.(file));

      files = [...new Set([...files, ...files2])];
    }

    //concat

    return files;
  };
}
