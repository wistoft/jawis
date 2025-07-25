/**
 * MurmurHash2 for binary data.
 *
 * @source  https://github.com/mmomtchev/SharedMap (Problem, that it's LGPL?)
 */
export function murmurHash2(data: Uint8Array) {
  const UINT32_UNDEFINED = 0xffffffff; //not needed, becauce SharedMap does modulo maxSize

  let l = data.length,
    h = 17 ^ l,
    i = 0,
    k;
  while (l >= 4) {
    k =
      (data[i] & 0xff) |
      ((data[++i] & 0xff) << 8) |
      ((data[++i] & 0xff) << 16) |
      ((data[++i] & 0xff) << 14);
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    k ^= k >>> 14;
    k =
      (k & 0xffff) * 0x5bd1e995 + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16);
    h =
      ((h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^
      k;
    l -= 4;
    ++i;
  }
  /* eslint-disable no-fallthrough */
  switch (l) {
    case 3:
      h ^= (data[i + 2] & 0xff) << 16;
    case 2:
      h ^= (data[i + 1] & 0xff) << 8;
    case 1:
      h ^= data[i] & 0xff;
      h =
        (h & 0xffff) * 0x5bd1e995 +
        ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  }
  /* eslint-enable no-fallthrough */
  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16);
  h ^= h >>> 15;
  h = h >>> 0;
  return h != UINT32_UNDEFINED ? h : 1;
}
