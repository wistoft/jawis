import { TestProvision } from "^jarun";
import { getSharedValidityVector } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const vector = getSharedValidityVector(prov);
  prov.eq(0, vector.getCount());
  prov.chk(!vector.isFull());
  prov.chk(vector.isEmpty());

  prov.eq(0, vector.get().index);
  prov.eq(1, vector.getCount());
  prov.chk(!vector.isFull());
  prov.chk(!vector.isEmpty());

  prov.eq(1, vector.get().index);
  prov.eq(2, vector.getCount());
  prov.chk(!vector.isFull());
  prov.chk(!vector.isEmpty());
};
