import ts from "typescript";

import { getAbsConfigFilePath, getTsPathsConfig } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { filterTsPathConfig } from "^tests/_fixture";

export default async (prov: TestProvision) => {
  prov.imp(
    filterTsPathConfig(
      getTsPathsConfig(
        {
          baseUrl: "_fixture",
          paths: { "^*": ["./packages/*"] },
        },
        getAbsConfigFilePath(ts, __dirname)
      )
    )
  );
};
