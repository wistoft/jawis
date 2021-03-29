import { TestProvision } from "^jarun";

export default (prov: TestProvision) => {
  prov.imp("arrrasdf");

  // sleeping(250)
  //   .then(() => {
  //     prov.imp("hej");
  //   })
  //   .catch(prov.onError);
  //
  // Promise.reject(new Error("hej"));
  //
  // setTimeout(() => {
  //   prov.imp("hej");
  // }, 100);
  //
  //hard because the callback should be intercepted async on a callback-by-callback basis.
  //
  // sleeping(200).then((data) => {
  //   console.log("arrr");
  // });
};
