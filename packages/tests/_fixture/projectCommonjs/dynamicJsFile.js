import("./library1.js").then(({ default: saySomething }) => {
  saySomething();
});
