import path from "node:path";
import fs from "node:fs";
import { TestProvision } from "^jarun";
import { getPromise } from "^yapu";
import {
  jacsConsumerMainDeclaration,
  makeJacsProducer,
  MakeMakeJacsBeeDeps,
} from "^jacs";

import { BeeDeps } from "^bee-common";
import { AbsoluteFile } from "^jabc/diverse";
import { getAbsoluteSourceFile_dev } from "^dev/util";
import { getBeeDeps, getTestNodepackCompileService, getTmpFolder } from ".";

/**
 *
 */
export const runJacsBee_test = async (
  prov: TestProvision,
  extraDeps?: Partial<MakeMakeJacsBeeDeps & BeeDeps<any>>
) => {
  const producer = await makeJacsProducer_test(prov, extraDeps);

  const bee = producer.makeJacsWorkerBee(getBeeDeps(prov, extraDeps));

  return bee.waiter.await("stopped");
};

/**
 *
 */
export const makeTsWorker_test = async (
  prov: TestProvision,
  filename: AbsoluteFile,
  _options?: WorkerOptions,
  extraDeps?: Partial<MakeMakeJacsBeeDeps>
) => {
  const prom = getPromise();

  const producer = await makeJacsProducer_test(prov, {
    ...extraDeps,
  });

  const options = {
    //must be true, because it's not possible to ensure stdio is piped to parent's stdio
    //  before exit is emitted.
    stdout: true,
    stderr: true,
    ..._options,
  };

  const worker = producer.makeTsWorker(filename, options as any);

  worker.stdout.addListener("data", (data) => {prov.log("worker.stdout", data.toString())}); // prettier-ignore
  worker.stderr.addListener("data", (data) => {prov.log("worker.stderr", data.toString())}); // prettier-ignore

  worker.addListener("exit", prom.resolve);

  return { worker, exitPromise: prom.promise };
};

/**
 *
 */
export const makeJacsProducer_test = async (
  prov: TestProvision,
  extraDeps?: Partial<MakeMakeJacsBeeDeps>
) => {
  const customBooter = await getJacsBooter_for_dev(prov);

  return makeJacsProducer({
    lazyRequire: true,
    cacheNodeResolve: true,
    tsConfigPath: true,
    doSourceMap: true,
    module: "commonjs",

    onError: prov.onError,
    finally: prov.finally,
    customBooter,
    ...extraDeps,
  });
};

/**
 *
 */
export const getJacsBooter_for_dev = async (prov: TestProvision) => {
  const compileService = getTestNodepackCompileService(prov);

  const booterCode = await compileService.load(
    getAbsoluteSourceFile_dev(jacsConsumerMainDeclaration)
  );

  const tmpfile = path.join(
    getTmpFolder("jacs-booter-for-dev"),
    jacsConsumerMainDeclaration.file + ".js"
  );

  await fs.promises.writeFile(tmpfile, booterCode);

  return tmpfile as AbsoluteFile;
};
