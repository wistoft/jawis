import { renderHook } from "^render-hook-plus";
import { useAssertStatic } from "^jab-react";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//hello

export default (prov: TestProvision) => {
  filterReact(prov);

  const { hook } = renderHook(useAssertStatic, { a: "dummy" });

  //no problem

  prov.imp(hook({ a: "dummy" }));

  //throws

  hook({ a: "other dummy" });
};
