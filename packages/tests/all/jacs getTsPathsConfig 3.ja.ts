import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

//handle no baseUrl.

export default async (prov: TestProvision) => {
  prov.imp(
    getTsPathsConfig(
      {
        paths: { "^*": ["./packages/*"] },
      },
      getAbsConfigFilePath(__dirname)
    )
  );
};
