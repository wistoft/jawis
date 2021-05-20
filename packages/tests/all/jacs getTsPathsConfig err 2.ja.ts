import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  prov.imp(
    getTsPathsConfig(
      {
        baseUrl: "dontExist",
      },
      getAbsConfigFilePath(__dirname)
    )
  );
};
