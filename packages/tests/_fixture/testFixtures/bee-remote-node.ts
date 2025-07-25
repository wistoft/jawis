import { TestProvision } from "^jarun";
import {
  MakeBareNodeProcess,
  RemoteNodeProcess,
  remoteNodeBooterMainDeclaration2,
} from "^bee-remote-node";
import { StdProcess } from "^process-util";

import { BeeDeps } from "^bee-common";
import { getBeeDeps, getTestNodepackCompileService } from "^tests/_fixture";
import { getAbsoluteSourceFile_dev } from "^dev/util";

/**
 *
 */
export const getRemoteNodeProcess = async (
  prov: TestProvision,
  extraDeps?: Partial<BeeDeps<any>>,
  makeBareNodeProcess: MakeBareNodeProcess = makeBareNodeProcessOnWsl
) => {
  const compileService = getTestNodepackCompileService(prov);

  const booterCode2 = await compileService.load(
    getAbsoluteSourceFile_dev(remoteNodeBooterMainDeclaration2)
  );

  const deps = getBeeDeps(prov, extraDeps);

  return new RemoteNodeProcess({
    ...deps,
    makeBareNodeProcess,
    booterCode2: booterCode2,
  });
};

/**
 *
 */
export const makeBareNodeProcessOnNode14: MakeBareNodeProcess = (deps) =>
  new StdProcess({
    ...deps,
    filename: "C:\\Users\\admin2\\AppData\\Roaming\\nvm\\v14.17.0\\node.exe",
    args: ["-e", deps.javascriptCode],
  });

/**
 *
 */
export const makeBareNodeProcessOnNode16: MakeBareNodeProcess = (deps) =>
  new StdProcess({
    ...deps,
    filename: "C:\\Users\\admin2\\AppData\\Roaming\\nvm\\v16.20.2\\node.exe",
    args: ["-e", deps.javascriptCode],
  });

/**
 *
 */
export const makeBareNodeProcessOnNode18: MakeBareNodeProcess = (deps) =>
  new StdProcess({
    ...deps,
    filename: "C:\\Users\\admin2\\AppData\\Roaming\\nvm\\v18.19.0\\node.exe",
    args: ["-e", deps.javascriptCode],
  });

/**
 *
 */
export const makeBareNodeProcessOnNode20: MakeBareNodeProcess = (deps) =>
  new StdProcess({
    ...deps,
    filename: "C:\\Users\\admin2\\AppData\\Roaming\\nvm\\v20.10.0\\node.exe",
    args: ["-e", deps.javascriptCode],
  });

/**
 *
 */
export const makeBareNodeProcessOnWsl: MakeBareNodeProcess = (deps) =>
  new StdProcess({
    ...deps,
    filename: "wsl",
    args: ["--exec", "node", "-e", deps.javascriptCode],
  });
