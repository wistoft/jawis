import(/* webpackIgnore: true */ "./library1.js").then(({ saySomething }) => {
  saySomething();
});

import(/* webpackIgnore: true */ "#library1").then(({ saySomething }) => {
  saySomething();
});
