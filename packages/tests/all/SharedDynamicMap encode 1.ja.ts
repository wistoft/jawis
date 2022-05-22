import { TestProvision } from "^jarun";
import { data1, empty, getSharedDynamicMap } from "^tests/_fixture";

export default (prov: TestProvision) => {
  const map = getSharedDynamicMap(prov);

  const test = (key: Uint8Array, value: Uint8Array) => {
    const enc = map._encodeKeyValue(key, value);
    const res = map._decodeKeyValue(enc);

    prov.eq(key, res.key);
    prov.eq(value, res.value);
  };

  test(empty, empty);
  test(empty, data1);
  test(data1, empty);

  map.dispose();
};
