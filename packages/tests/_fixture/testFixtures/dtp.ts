import { DependencyGraph, DtpController, extractDeps } from "^misc/dtp";

import { getSourceFile } from "./ts";
import { getInMemoryCompilerHost } from "./ts compiler host";

/**
 *
 */
export const getDtpGraph = (defaultFiles: { [_: string]: string }) => {
  const host = getInMemoryCompilerHost(
    {},
    {
      defaultFiles,
      debug: () => {},
    }
  );

  const g = new DependencyGraph();

  Object.keys(defaultFiles).forEach((file) => {
    const code = defaultFiles[file];

    const info = extractDeps(getSourceFile(code, file), {}, host);

    g.addInfo(info, file);
  });

  return g;
};

/**
 *
 */
export const getDtpController = (defaultFiles: { [_: string]: string }) => {
  const compilerOptions = {};

  const compilerHost = getInMemoryCompilerHost(compilerOptions, {
    defaultFiles,
    debug: () => {},
  });

  return new DtpController({
    compilerHost,
    compilerOptions,
    absTestFolder: "/",
  });
};
