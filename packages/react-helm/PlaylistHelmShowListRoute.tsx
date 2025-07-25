import React, { memo } from "react";
import { useParams } from "react-router-dom";

import { assertPropString } from "^jab";

import { DataProvider, ItemActions, SimpleHelm } from "./internal";

type Props = {
  getListContentProvider: (name: string) => DataProvider;
  keyEditable: boolean;
  itemActions: ItemActions;
};

/**
 *
 */
export const PlaylistHelmShowListRoute: React.FC<Props> = memo(
  ({ getListContentProvider, keyEditable, itemActions }) => {
    const params = useParams();

    const name = assertPropString(params, "name");

    //lookup "props"

    const tmp = getListContentProvider(name);

    //adapt

    const dataProvider = { ...tmp, new: undefined };

    //render

    return (
      <>
        <div>{name}</div>
        <SimpleHelm
          dataProvider={dataProvider}
          keyEditable={keyEditable}
          itemActions={itemActions}
          postActionContent={undefined}
        />
      </>
    );
  }
);

PlaylistHelmShowListRoute.displayName = "PlaylistHelmShowListRoute";
