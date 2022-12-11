const copyfiles = require("copyfiles");

/**
 * Make copyfiles use promise.
 */
const copyingFiles = (paths, options) =>
  new Promise((res, rej) => {
    const callback = (err, val) => {
      if (err) {
        rej(err);
      } else {
        res(val);
      }
    };

    if (options) {
      copyfiles(paths, options, callback);
    } else {
      copyfiles(paths, callback);
    }
  });

/**
 *
 */
const sortObject = (obj) => {
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));

  const res = {};

  for (const key of keys) {
    res[key] = obj[key];
  }

  return res;
};

//
// exports
//

module.exports = {
  copyingFiles,
  sortObject,
};
