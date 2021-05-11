import { TestProvision } from "^jarun";

// process.on("uncaughtException", (error: any) => {
//   console.log(error.__jawisNodeStack);
// });

export default (prov: TestProvision) => {
  // console.log("listeners: " + process.listenerCount("uncaughtException"));

  // setTimeout(() => {
  //   throw new Error("hej");
  // }, 0);

  throw new Error("hej");
  // try {
  //   throw new Error("hej");
  // } catch (error) {
  //   console.log(error.__jawisNodeStack);
  // }
};
//
//
