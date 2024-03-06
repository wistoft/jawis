import { useEffect } from "react";
import { renderHook } from "^render-hook-plus";
import { TestProvision } from "^jarun";
import { filterReact } from "^tests/_fixture";

//throws in useEffect

export default (prov: TestProvision) => {
  filterReact(prov);

  renderHook(() => {
    useEffect(() => {
      throw new Error("ups");
    });
  });
};
