/**
 *
 */
export const difference = (a: string[], b: string[]) => {
  const set = new Set(b);
  return a.filter((x) => !set.has(x));
};

/**
 *
 */
export const setDifference = (a: Set<string>, ...bs: Set<string>[]) => {
  const res = new Set<string>();

  a.forEach((elm) => {
    for (const b of bs) {
      if (b.has(elm)) {
        return;
      }
    }

    res.add(elm);
  });

  return res;
};
