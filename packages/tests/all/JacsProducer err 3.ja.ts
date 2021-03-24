import { TestProvision } from "^jarun";
import { prej } from "^jab";
import { getSourceFileLoaderMock, makeProducerOnCompile } from "../_fixture";

export default (prov: TestProvision) => {
  const { onCompile, controlArray, dataArray } = makeProducerOnCompile(prov, {
    notify: () => 1,
    sfl: {
      ...getSourceFileLoaderMock(),
      load: (file) => prej("failed: " + file),
    },
  });

  return onCompile("some file").catch((error) => {
    prov.onError(error);

    prov.imp({ controlArray, dataArray });

    return onCompile("other file");
  });
};
//
