import(/* webpackIgnore: true */ "./library2.cjs").then(
  ({ default: saySomething }) => {
    saySomething();
  }
);
