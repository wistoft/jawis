import { getAbsConfigFilePath, getTsPathsConfig } from "^ts-config-util";
import { TestProvision } from "^jarun";
import { filterTsPathConfig } from "^tests/_fixture";

//handle no baseUrl.

export default async (prov: TestProvision) => {
  prov.imp(
    filterTsPathConfig(
      getTsPathsConfig(
        {
          paths: { "^*": ["./packages/*"] },
        },
        getAbsConfigFilePath(__dirname)
      )
    )
  );
};
