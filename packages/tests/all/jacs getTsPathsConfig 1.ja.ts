import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
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
        getAbsConfigFilePath(__dirname)
      )
    )
  );
};
