import path from "node:path";
import ts, { CompilerOptions } from "typescript";

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
 * - library files are served from file system.
 *
 * impl
 *  all files are absolute (starting with /) in the `fileSystem`
 */
export const getInMemoryCompilerHost = (
  options: CompilerOptions,
  { defaultFiles, debug = () => {} }: Deps,
  host: ts.CompilerHost = ts.createCompilerHost(options)
) => {
  const libFile = ts.getDefaultLibFilePath(options).replace(/\\/g, "/");

  const libFolder = path.dirname(libFile);

  //normalize file names.

  const fileSystem: { [_: string]: string } = {};

  Object.entries(defaultFiles).forEach(([file, value]) => {
    fileSystem[makeAbsolute(file)] = value;
  });

  //the host

  host.fileExists = (file) => {
    const abs = makeAbsolute(file);

    if (fileSystem[abs] !== undefined) {
      debug("fileExists:" + file);
      return true;
    }

    debug("fileExists, not:" + file);

    return false;
  };

  host.directoryExists = (dir) => {
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
  };

  host.getCurrentDirectory = () => {
    debug("getCurrentDirectory");
    return "/";
  };

  host.readDirectory = (rootDir, extensions, excludes, includes, depth) => {
    throw new Error("not impl");

    debug("readDirectory: " + rootDir);
    return ts.sys.readDirectory(rootDir, extensions, excludes, includes, depth);
  };

  host.getDirectories = () => [];
  host.getCanonicalFileName = (fileName) => fileName;
  host.getNewLine = () => "\n";
  host.useCaseSensitiveFileNames = () => true;
  host.getDefaultLibFileName = () => libFile;

  /**
   *
   */
  host.readFile = (file) => {
    debug("readFile: " + file);

    //read lib files from file system.

    if (file.startsWith(libFolder)) {
      return ts.sys.readFile(file);
    }

    const abs = makeAbsolute(file);

    if (abs in fileSystem) {
      return fileSystem[abs];
    }

    debug("readFile: not found: " + file);
  };

  /**
   * todo: what to do with: writeByteOrderMark, onError, sourceFiles
   */
  host.writeFile = (
    file,
    data,
    _writeByteOrderMark,
    _onError,
    _sourceFiles
  ) => {
    fileSystem[makeAbsolute(file)] = data;
  };

  return host;
};
