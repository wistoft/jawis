import { TestProvision } from "^jarun";

import { renderHook } from "@testing-library/react-hooks";

//bug: no type error, when props to the hook are missing entirely.

export default (prov: TestProvision) => {
  const { result } = renderHook((prop: { hej: string }) => prop.hej);

  throw result.error; //also buggy, this is needed.
};
