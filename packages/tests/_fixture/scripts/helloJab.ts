//clear cache

Object.keys(require.cache).forEach((key) => {
  delete require.cache[key];
});

// prove jab is compiled

import { basename } from "^jab";

console.log(basename("mikael/wistoft"));
