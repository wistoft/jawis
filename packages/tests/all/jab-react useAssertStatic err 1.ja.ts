import { wrapHook } from "^misc/node";
import { useAssertStatic } from "^jab-react";
import { TestProvision } from "^jarun";

//hello

export default (prov: TestProvision) => {
  const { hook } = wrapHook(useAssertStatic, { a: "dummy" });

  //no problem

  prov.imp(hook({ a: "dummy" }));

  //throws

  hook({ a: "other dummy" });
};
