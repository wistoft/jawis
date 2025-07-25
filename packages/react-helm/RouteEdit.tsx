import React, { memo } from "react";
import { useParams } from "react-router-dom";

import { tryProp } from "^jab";

import { DataProvider, ViewEdit } from "./internal";

type Props = {
  dataProvider: DataProvider;
  onSubmit: NonNullable<DataProvider["edit"]>;
  keyEditable: boolean;
};

/**
 *
 */
export const RouteEdit: React.FC<Props> = memo(
  ({ dataProvider, onSubmit, keyEditable }) => {
    const params = useParams();

    const name = tryProp(params, "name");

    //lookup "props"

    const item = dataProvider.data.find((item) => item.name === name);

    //render

    if (item) {
      return (
        <ViewEdit
          onSubmit={onSubmit}
          initial={item}
          keyEditable={keyEditable}
        />
      );
    } else {
      return <>Data item not found</>;
    }
  }
);

RouteEdit.displayName = "RouteEdit";
