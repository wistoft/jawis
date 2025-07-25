import { TestProvision } from "^jarun";
import { makeProducerOnCompile } from "../_fixture";

export default (prov: TestProvision) => {
  const { onCompile } = makeProducerOnCompile(prov, {
    notify: () => 1,
  });

  return onCompile("some file").then((data) => {
    prov.imp(data);
    return onCompile("other file");
  });
};
