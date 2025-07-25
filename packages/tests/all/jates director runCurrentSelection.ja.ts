import { TestProvision } from "^jarun";
import { getJatesDirector } from "^tests/_fixture/index";
import { sleeping } from "^yapu/yapu";

export default async (prov: TestProvision) => {
  const director = getJatesDirector(prov, {}, [
    {
      type: "log",
      data: ["Log from external"],
    },
  ]);

  director.onClientMessage({ type: "runCurrentSelection" });

  await director.shutdown();

  //quick fix, because jates.shutdown doesn't wait properly
  return sleeping(1000);
};
