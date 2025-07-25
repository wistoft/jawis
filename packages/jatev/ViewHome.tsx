import React, { memo, useEffect } from "react";

import { SimpleHelm, DataItem, DataProvider } from "^react-helm";
import { State, ApiProv } from "./internal";

type ViewHomeProps = Pick<ApiProv, "apiSend" | "wsState"> & {
  state: State;
};

/**
 * Show a list of all test cases.
 */
export const ViewHome: React.FC<ViewHomeProps> = memo(
  ({ state, apiSend, wsState }) => {
    useEffect(() => {
      if (state.tests === undefined) {
        if (wsState === "connected") {
          apiSend({ type: "getAllTests" });
        }
      }
    }, [wsState]);

    return (
      <>
        {" "}
        <br />
        To run tests: click <i>cur</i> or <i>all</i>, and reload page.
        <br />
        <br />
        <SimpleHelm dataProvider={makeDataProvider(state)} />
      </>
    );
  }
);

ViewHome.displayName = "ViewHome";

/**
 * quick fix
 */
export const makeDataProvider = (state: State): DataProvider => ({
  data: makeDataItems(state),
});

const makeDataItems = (state: State) =>
  !state.tests
    ? []
    : state.tests.tests.reduce<DataItem[]>(
        (acc, cur) =>
          acc.concat(
            cur.map((test) => ({
              name: test.name,
              data:
                test.status === undefined
                  ? ""
                  : test.status === "."
                    ? "pass"
                    : "fail",
            }))
          ),
        []
      );
