import { TestProvision } from "^jarun";
import { getSharedValidityVector } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const vector = getSharedValidityVector(prov);

  const { index, version } = vector.get();

  prov.eq(0, index);
  prov.chk(vector.isValid(index, version));

  vector.invalidate(index, version);

  prov.chk(!vector.isValid(index, version));

  prov.eq(0, vector.get().index);
};
