import { getTsConfigFromAbsConfigFile } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { filterTsConfig, getTsProjectPath } from "^tests/_fixture";

const { getPackagePath } = require("../../../packages/dev/project.conf");

export default ({ imp }: TestProvision) => {
  const c = getTsConfigFromAbsConfigFile(getTsProjectPath("tsconfig.json"));

  imp(filterTsConfig(c));

  imp(
    filterTsConfig(
      getTsConfigFromAbsConfigFile(getPackagePath("tests/tsconfig.json"))
    )
  );
};
