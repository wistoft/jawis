import { beeExit } from "^jab";

// Promise.reject(new Error("hej")); //not transferred in dev sites.

console.log("dav");
(postMessage as any)("my message");

//this is needed, because web workers don't detect when it has no more work to do.

setTimeout(() => {
  beeExit();
}, 500);
