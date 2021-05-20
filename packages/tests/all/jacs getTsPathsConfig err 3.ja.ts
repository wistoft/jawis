import { getAbsConfigFilePath, getTsPathsConfig } from "^jacs";
import { TestProvision } from "^jarun";

export default async (prov: TestProvision) => {
  prov.imp(
    getTsPathsConfig(
      {
        paths: { ups: ["dontExist"] },
      },
      getAbsConfigFilePath(__dirname)
    )
  );
};
