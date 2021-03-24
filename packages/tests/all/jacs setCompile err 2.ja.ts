import { TestProvision } from "^jarun";
import { getControlArray, setCompiling } from "^jacs/protocol";

export default (prov: TestProvision) => {
  const controlArray = getControlArray();

  setCompiling(controlArray);
};
