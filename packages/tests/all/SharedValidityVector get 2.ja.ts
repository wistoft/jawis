import { TestProvision } from "^jarun";
import { getSharedValidityVector } from "^tests/_fixture";

//index is reused, when invalidated.

export default (prov: TestProvision) => {
  const vector = getSharedValidityVector(prov);

  const { index, version } = vector.get();

  prov.chk(vector.isValid(index, version));

  vector.invalidate(index, version);

  prov.chk(!vector.isValid(index, version));

  prov.eq(index, vector.get().index); //same index again.
};
