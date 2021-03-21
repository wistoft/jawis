import path from "path";
import ts, { CompilerOptions } from "typescript";

import { tos } from "^jab";

type Deps = {
  defaultFiles: { [_: string]: string };
  debug?: (str: string) => void;
};

const makeAbsolute = (input: string) => {
  if (input === ".") {
    return "/";
  }

  const file = input.replace(/^(\.\/)/, "");
  if (file.startsWith("/")) {
    return file;
  } else {
    return "/" + file;
  }
};

/**
 *
 * - Everything is served from the root directory: /
 * - Current directory is /
 * - default files doesn't need to have preceeding slash. They are in root directory by default.
 * - library files are served form file system.
 *
 * impl
 *  all files are absolute (starting with /) in the `fileSystem`
 */
export const getInMemoryCompilerHost = (
  options: CompilerOptions,
  { defaultFiles, debug = () => {} }: Deps
) => {
  const scriptTarget = ts.ScriptTarget.Latest;

  const libFile = ts.getDefaultLibFilePath(options).replace(/\\/g, "/");

  const libFolder = path.dirname(libFile);

  //normalize file names.

  const fileSystem: { [_: string]: string } = {};

  Object.entries(defaultFiles).forEach(([file, value]) => {
    fileSystem[makeAbsolute(file)] = value;
  });

  //the host

  const host: ts.CompilerHost = {
    fileExists: (file) => {
      const abs = makeAbsolute(file);

      if (fileSystem[abs] !== undefined) {
        debug("fileExists:" + file);
        return true;
      }

      debug("fileExists, not:" + file);

      return false;
    },
    directoryExists: (dir) => {
      const a = makeAbsolute(dir);

      let abs: string;
      if (a.endsWith("/")) {
        abs = a;
      } else {
        abs = a + "/";
      }

      for (const file in fileSystem) {
        if (file.startsWith(abs)) {
          debug("dirExists:" + dir);
          return true;
        }
      }

      debug("dirExists, not:" + dir);
      return false;
    },
    getCurrentDirectory: () => {
      debug("getCurrentDirectory");
      return "/";
    },
    readDirectory: (rootDir, extensions, excludes, includes, depth) => {
      throw new Error("not impl");

      debug("readDirectory: " + rootDir);
      return ts.sys.readDirectory(
        rootDir,
        extensions,
        excludes,
        includes,
        depth
      );
    },
    getDirectories: () => [],
    getCanonicalFileName: (fileName) => fileName,
    getNewLine: () => "\n",
    useCaseSensitiveFileNames: () => true,
    getDefaultLibFileName: () => libFile,

    /**
     * todo: what to do with these: languageVersion, shouldCreateNewSourceFile
     */
    getSourceFile: (file) => {
      debug("getSourceFile:" + file);

      const abs = makeAbsolute(file);

      //default files.

      if (abs in fileSystem) {
        return ts.createSourceFile(file, fileSystem[abs], scriptTarget);
      }

      //read lib files from file system.

      if (file.startsWith(libFolder)) {
        return ts.createSourceFile(
          file,
          ts.sys.readFile(file) || "",
          scriptTarget
        );
      }

      console.log("getSourceFile: not found: " + file);
    },

    /**
     *
     */
    readFile: (file) => {
      debug("readFile:" + file);

      const abs = makeAbsolute(file);

      if (abs in fileSystem) {
        return fileSystem[abs];
      }

      console.log("readFile: not found: " + file);
    },

    /**
     *
     */
    writeFile: (file, data, writeByteOrderMark, onError, sourceFiles) => {
      fileSystem[makeAbsolute(file)] = data;

      console.log(
        "writeFile: don't know what to do with: " +
          tos({ writeByteOrderMark, sourceFiles })
      );
    },
  };

  return host;
};
