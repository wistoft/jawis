import prettier from "prettier";
import { SourceFileLoader } from "^jacs/";
import { TestProvision } from "^jarun";

import {
  filterAbsoluteFilepathInFreetext,
  getTsProjectPath,
} from "../_fixture";

export default async (prov: TestProvision) => {
  const sfl = new SourceFileLoader({
    lazyRequire: true,
    lazyRequireIndexFiles: true,
    module: "commonjs",
    onError: prov.onError,
  });

  const code = await sfl.load(getTsProjectPath("index.ts"));

  try {
    return filterAbsoluteFilepathInFreetext(
      await prettier.format(code, { parser: "babel" })
    );
  } catch (error) {
    prov.onError(error);
    return code;
  }
};
