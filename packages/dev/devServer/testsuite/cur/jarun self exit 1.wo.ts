import { prej } from "^jab";

//stdout should not get lost in case of unhandled exception

console.log("1");
console.log("2");
console.log("3");

//prevent

setTimeout(() => {
  console.log("The process mustn't wait for this.");
}, 4000);

setTimeout(() => {
  console.log("Should be too late.");
  prej("promise reject will still be reported"); //even though stdout wont.
}, 0);

//let's try.

throw new Error("ups");
