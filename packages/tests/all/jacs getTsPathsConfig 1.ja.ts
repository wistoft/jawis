import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  prov.imp(
    getTsPathsConfig(
      {
        baseUrl: "_fixture",
        paths: { "^*": ["./packages/*"] },
      },
      getAbsConfigFilePath(__dirname)
    )
  );
};
