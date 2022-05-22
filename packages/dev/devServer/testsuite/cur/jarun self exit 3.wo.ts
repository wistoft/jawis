import { prej } from "^jab";

//promise rejection cause process exit.

prej("hej");

//prevent

setTimeout(() => {
  console.log("The process mustn't wait for this.");
}, 4000);

setTimeout(() => {
  console.log("Should be too late.");
}, 0);
