import { nodeRequire } from "^jab-node";
import { getTsConfigFromAbsConfigFile } from "^jacs";
import { TestProvision } from "^jarun";
import { filterTsConfig, getTsProjectPath } from "^tests/_fixture";

const { getPackagePath } = require("../../../project.conf");

export default ({ imp }: TestProvision) => {
  const c = getTsConfigFromAbsConfigFile(getTsProjectPath("tsconfig.json"));

  imp(filterTsConfig(c));

  imp(
    filterTsConfig(
      getTsConfigFromAbsConfigFile(getPackagePath("tests/tsconfig.json"))
    )
  );
};
