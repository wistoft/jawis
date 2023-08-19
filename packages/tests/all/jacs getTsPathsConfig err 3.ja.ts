import ts from "typescript";

import { getAbsConfigFilePath, getTsPathsConfig } from "^ts-config-util";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  prov.imp(
    getTsPathsConfig(
      {
        paths: { ups: ["dontExist"] },
      },
      getAbsConfigFilePath(ts, __dirname)
    )
  );
};
