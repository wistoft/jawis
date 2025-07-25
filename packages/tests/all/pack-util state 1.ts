import { TestProvision } from "^jarun";

import { State } from "^pack-util";

export default (prov: TestProvision) => {
  // simple states

  const state = new State({ startState: { type: "hej" } });

  state.set({ type: "hej" });

  // states with data

  const s2 = new State<{ type: "hej" } | { type: "dav"; extra: string }>({
    startState: { type: "hej" },
  });

  s2.set({ type: "dav", extra: "fido" });
};
