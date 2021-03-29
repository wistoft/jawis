export {};

// out(undefined);

// // console.log(1, process.listenerCount("unhandledRejection"));
// // console.log(2, process.listenerCount("uncaughtException"));

// out(new Error("sf"));

// // // console.log(e.stack);

// // throw e;
// // //

// // // const start = Date.now();
// // // while (Date.now() - start < 2000) {
// // //   /* no op*/
// // // }

// // // sleeping(2000);

// // // require("asdf");

// setInterval(() => {
//   // throw new Error("ups");
//   // prej("ups");
// }, 1000);

console.log("script", process.listenerCount("uncaughtException"));
// throw new Error("hej");
