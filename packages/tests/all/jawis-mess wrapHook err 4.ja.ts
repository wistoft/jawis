import { useEffect } from "react";
import { renderHook_e1 } from "^render-hook-plus";
import { TestProvision } from "^jarun";
import { sleeping } from "^yapu";
import { filterReact } from "^tests/_fixture";

//throws in useEffect (unmount)

export default (prov: TestProvision) => {
  filterReact(prov);

  const { unmount } = renderHook_e1(() => {
    useEffect(() => {
      console.log("mount");
      return () => {
        console.log("in unmount");
        //this is executed, but the exception is squashed.
        throw new Error("ups");
      };
    });
  });

  unmount();

  return sleeping(10); //to wait for unmount-exception
};
