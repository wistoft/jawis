import { Router } from "@reach/router";
import React from "react";
import { def } from "^jab";

import { ReachRoute, NoRoute } from "^jab-react";
import { ViewNew } from ".";
import { View } from "./View";

export type Props = {
  dataProvider: DataProvider;
};

export type DataProvider = {
  data: DataItem[];
  delete?: (name: string) => void;
  new?: (name: string, data: string) => void;
};

export type DataItem = {
  name: string;
  data: string;
};

/**
 *
 */
export const HelmDirector: React.FC<Props> = ({ dataProvider }) => {
  return (
    <Router>
      <ReachRoute path={"/"} element={<View dataProvider={dataProvider} />} />
      {dataProvider.new && (
        <ReachRoute
          path={"/new"}
          element={<ViewNew onNew={def(dataProvider.new)} />}
        />
      )}
      <NoRoute path="*" />
    </Router>
  );
};
