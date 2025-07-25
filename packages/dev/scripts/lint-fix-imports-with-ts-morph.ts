import path from "node:path";
import { err } from "^jab";
import { isBuiltin } from "node:module";
import { Project, FileSystemHost, InMemoryFileSystemHost } from "ts-morph";
import { projectRoot } from "^dev/project.conf";
import { makeCanonical, mapFolder } from "^jab-node";

/**
 *
 * q
 *  - If this can handle `d.ts` files. It could be used instead of `tsc-alias`
 */
export const main = async () => {
  // await assertGitClean(projectRoot);

  const project = new Project({ fileSystem: new MyCustomFileSystem() });

  project.addSourceFilesAtPaths("packages/**/*.ts");
  project.addSourceFilesAtPaths("packages/**/*.tsx");

  for (const file of project.getSourceFiles()) {
    for (const decl of file.getImportDeclarations()) {
      const spec = decl.getModuleSpecifier();

      const value = spec.getLiteralValue();

      //ignore relative imports

      if (value.startsWith(".")) {
        continue;
      }

      // sibling import in test fixture projects

      if (value.startsWith("#")) {
        continue;
      }

      // sibling import

      if (value.startsWith("^")) {
        const match = value.match(/^\^\/?([a-z0-9\-_]+)(\/.*)?$/);
        if (match === null) {
          throw err("import has unexpected format", { value });
        }
        const pack = match[1];
        const file = "/index" === match[2] || !match[2] ? "" : match[2];

        spec.setLiteralValue("^" + pack + file);

        continue;
      }

      //node built-in

      if (isBuiltin(value)) {
        if (!value.startsWith("node:")) {
          spec.setLiteralValue("node:" + value);
        }
        continue;
      }
    }
  }

  // save

  await project.save();

  await mapFolder(projectRoot + "/**/package.d.ts", (content: string) =>
    content
      .replace(/declare module "/g, 'declare module "')
      .replace(/declare module "/g, 'declare module "')
      .replace(/declare module "exit/g, 'declare module "exit')
  );
};

/**
 * Avoid writing files, that hasn't changed.
 */
class MyCustomFileSystem implements FileSystemHost {
  private fileSystem: FileSystemHost;
  private cache: Map<string, string> = new Map();

  constructor() {
    this.fileSystem = new Project().getFileSystem();
  }

  isCaseSensitive() {
    return this.fileSystem.isCaseSensitive();
  }
  realpathSync(path: string) {
    return this.fileSystem.realpathSync(path);
  }
  getCurrentDirectory() {
    return this.fileSystem.getCurrentDirectory();
  }

  readDirSync(dirPath: string) {
    return this.fileSystem.readDirSync(dirPath);
  }
  readFileSync(filePath: string, encoding?: string) {
    const res = this.fileSystem.readFileSync(filePath, encoding);

    this.cache.set(makeCanonical(filePath as any), res);

    return res;
  }

  readFile = async (filePath: string, encoding?: string) => {
    const res = await this.fileSystem.readFile(filePath, encoding);

    this.cache.set(makeCanonical(filePath as any), res);

    return res;
  };

  fileExists(filePath: string) {
    return this.fileSystem.fileExists(filePath);
  }
  fileExistsSync(filePath: string) {
    return this.fileSystem.fileExistsSync(filePath);
  }

  directoryExists(dirPath: string) {
    return this.fileSystem.directoryExists(dirPath);
  }
  directoryExistsSync(dirPath: string) {
    return this.fileSystem.directoryExistsSync(dirPath);
  }

  glob(patterns: ReadonlyArray<string>) {
    return this.fileSystem.glob(patterns);
  }
  globSync(patterns: ReadonlyArray<string>) {
    return this.fileSystem.globSync(patterns);
  }

  delete(path: string) {
    return this.fileSystem.delete(path);
  }
  deleteSync(path: string) {
    return this.fileSystem.deleteSync(path);
  }

  writeNeeded(filePath: string, fileText: string) {
    const cachedData = this.cache.get(makeCanonical(filePath as any));

    return cachedData !== fileText;
  }

  writeFile = async (filePath: string, fileText: string) => {
    if (this.writeNeeded(filePath, fileText)) {
      await this.fileSystem.writeFile(filePath, fileText);
    }
  };

  writeFileSync(filePath: string, fileText: string) {
    if (this.writeNeeded(filePath, fileText)) {
      this.fileSystem.writeFileSync(filePath, fileText);
    }
  }

  mkdir(dirPath: string) {
    return this.fileSystem.mkdir(dirPath);
  }
  mkdirSync(dirPath: string) {
    return this.fileSystem.mkdirSync(dirPath);
  }

  move(srcPath: string, destPath: string) {
    return this.fileSystem.move(srcPath, destPath);
  }
  moveSync(srcPath: string, destPath: string) {
    return this.fileSystem.moveSync(srcPath, destPath);
  }

  copy(srcPath: string, destPath: string) {
    return this.fileSystem.copy(srcPath, destPath);
  }
  copySync(srcPath: string, destPath: string) {
    return this.fileSystem.copySync(srcPath, destPath);
  }
}
