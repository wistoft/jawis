import ts from "typescript";

import { getTsConfigFromAbsConfigFile } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { filterTsConfig, getTsProjectPath } from "^tests/_fixture";

export default ({ imp }: TestProvision) => {
  imp(
    filterTsConfig(
      getTsConfigFromAbsConfigFile(ts, getTsProjectPath("tsconfig.json"))
    )
  );
};
