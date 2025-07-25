import path from "node:path";
import ts, { CompilerOptions } from "typescript";

import { assert } from "^jab";

type CompileHostDeps = {
  options: CompilerOptions;
  debug?: (str: string) => void;
  host?: ts.CompilerHost;
};

/**
 * Extend TypeScript CompilerHost
 *
 * - Keep default read behavior of TypeScript
 * - Write all output to memory.
 * - Add debugging to file system calls.
 * - host is configurable because 'incremental' has it's own host `ts.createIncrementalCompilerHost`
 *
 * note
 *  - test fixture have a complete in-memory host: `getInMemoryCompilerHost`
 */
export const getTsCompileHost = ({
  options,
  debug = () => {},
  host = ts.createCompilerHost(options),
}: CompileHostDeps) => {
  const output: { [_: string | number]: string } = {};

  //to detect lib files

  const libFile = ts.getDefaultLibFilePath(options).replace(/\\/g, "/");

  const libFolder = path.dirname(libFile);

  //the host

  const fileExistsOrg = host.fileExists;

  host.fileExists = (file: string, ...args) => {
    assert(args.length === 0);

    const res = fileExistsOrg(file);

    if (res) {
      debug("fileExists:" + file);
    } else {
      debug("fileExists, not:" + file);
    }

    return res;
  };

  if (!host.directoryExists) {
    throw new Error("directoryExists is missing");
  }

  const directoryExistsOrg = host.directoryExists;

  host.directoryExists = (dir: string, ...args) => {
    assert(args.length === 0);

    if (dir === path.join(__dirname, "../../../node_modules/@types")) {
      //quick fix, so it doesn't read all type files when unit testing
      return false;
    }

    const res = directoryExistsOrg(dir);

    if (res) {
      debug("directoryExists:" + dir);
    } else {
      debug("directoryExists, not:" + dir);
    }

    return res;
  };

  const readFileOrg = host.readFile;

  host.readFile = (file: string, ...args) => {
    assert(args.length === 0);

    const res = readFileOrg(file);

    if (res !== undefined) {
      if (file.startsWith(libFolder)) {
        debug("libFile:" + file);
      } else {
        debug("readFile:" + file);
      }
    } else {
      debug("readFile, not:" + file);
    }

    return res;
  };

  /**
   * what to do with: writeByteOrderMark, onError, sourceFiles
   */
  host.writeFile = (
    file,
    data,
    _writeByteOrderMark,
    _onError,
    _sourceFiles
  ) => {
    output[file.replace(/\\/g, "/")] = data;
  };

  return { host, output };
};
