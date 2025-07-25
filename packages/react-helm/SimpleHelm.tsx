import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { def } from "^jab";
import { NoRouteElement } from "^jab-react";

import {
  DataProvider,
  RouteEdit,
  ViewEdit,
  ViewList,
  ViewListProps,
} from "./internal";

export type SimpleHelmProps = {
  dataProvider: DataProvider;
  keyEditable?: boolean; //default: false
} & Omit<ViewListProps, "onEdit">;

/**
 *
 */
export const SimpleHelm: React.FC<SimpleHelmProps> = ({
  dataProvider,
  keyEditable,
  itemActions,
  postActionContent,
}) => {
  const navigate = useNavigate();

  const onEdit =
    dataProvider.edit === undefined
      ? undefined
      : (name: string) => {
          navigate("./edit/" + name);
        };

  return (
    <Routes>
      <Route
        path={"/"}
        element={
          <ViewList
            dataProvider={dataProvider}
            onEdit={onEdit}
            itemActions={itemActions}
            postActionContent={postActionContent}
          />
        }
      />
      {dataProvider.new && (
        <Route
          path={"/new"}
          element={
            <ViewEdit
              onSubmit={def(dataProvider.new)}
              initial={{ name: "", data: "" }}
              keyEditable={true}
            />
          }
        />
      )}
      {dataProvider.edit && (
        <Route
          path={"/edit/:name"}
          element={
            <RouteEdit
              dataProvider={dataProvider}
              onSubmit={def(dataProvider.edit)}
              keyEditable={keyEditable ?? false}
            />
          }
        />
      )}
      {NoRouteElement}
    </Routes>
  );
};
