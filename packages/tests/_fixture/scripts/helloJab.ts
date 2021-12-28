//clear cache

Object.keys(require.cache).forEach((key) => {
  delete require.cache[key];
});

// prove jab is compiled

import { basename } from "^jab";

try {
  console.log(basename("mikael/wistoft"));
} catch (error) {
  console.log(error);
}
