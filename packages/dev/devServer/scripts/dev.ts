export {};

console.log("hej");
console.log("dav"); //bug that this is squashed.

setTimeout(() => {
  throw new Error("usp");
}, 4000);

// process.on("exit", function () {
//   process.exit(0);
// });

throw new Error("ups");

// prej("dav");
