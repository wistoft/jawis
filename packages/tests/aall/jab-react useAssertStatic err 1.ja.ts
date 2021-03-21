import { renderHookImproved } from "^jawis-mess/node";
import { useAssertStatic } from "^jab-react";
import { TestProvision } from "^jarun";

//hello

export default (prov: TestProvision) => {
  const { rerender } = renderHookImproved(useAssertStatic, { a: "dummy" });

  //no problem

  prov.imp(rerender({ a: "dummy" }));

  //throws

  rerender({ a: "other dummy" });
};
