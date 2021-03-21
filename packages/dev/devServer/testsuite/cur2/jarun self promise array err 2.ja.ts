import { nightmare } from "^jab";

export default () => [
  nightmare(100),
  Promise.reject(new Error("upsa")),
  Promise.resolve({ hello: "dav" }),
];
