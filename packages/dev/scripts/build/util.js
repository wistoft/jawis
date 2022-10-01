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

//
// exports
//

module.exports = {
  copyingFiles,
};
