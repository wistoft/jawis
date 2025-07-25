import React, { useState, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Link, Route, Routes, JsLink, NoRouteElement } from "^jab-react";

import {
  DataProvider,
  PlaylistHelmShowListRoute,
  SimpleHelm,
} from "./internal";

type Props = {
  dataProvider: DataProvider;
  listProvider: DataProvider;
  getListContentProvider: (name: string) => DataProvider;
  keyEditable?: boolean; //default: false
};

/**
 *
 */
export const PlaylistHelm: React.FC<Props> = ({
  dataProvider,
  listProvider,
  getListContentProvider,
  keyEditable,
}) => {
  const [dragging, setDragging] = useState(false);

  const navigate = useNavigate();

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "link";
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    const id = event.dataTransfer.getData("text/plain");

    console.log(id);
  };

  const lists = listProvider.data.map((item) => (
    <span key={item.name} onDragOver={onDragOver} onDrop={onDrop}>
      <JsLink
        onClick={() => {
          navigate("./show-list/" + item.name);
        }}
      >
        {dragging ? <b>{item.name + " "}</b> : item.name + " "}
      </JsLink>
    </span>
  ));

  const simpleListMenu = (
    <div>
      <Link to={"./"}>data</Link>, <Link to={"show-lists"}>lists</Link>
      &nbsp;&nbsp; {lists}
    </div>
  );

  const onDragStart = (event: DragEvent<any>) => {
    setDragging(true);

    event.dataTransfer.setData("text/plain", (event.target as any).id);
  };

  const onDragEnd = () => {
    setDragging(false);
  };

  return (
    <>
      <nav>{simpleListMenu}</nav>

      <Routes>
        <Route
          path={"/*"}
          element={
            <>
              <SimpleHelm
                dataProvider={dataProvider}
                keyEditable={keyEditable}
                itemActions={() => []}
                postActionContent={(name: string) => (
                  <span
                    id={name}
                    draggable="true"
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                  >
                    drag
                  </span>
                )}
              />
            </>
          }
        />{" "}
        <Route
          path={"/show-lists/*"}
          element={
            <>
              <SimpleHelm
                dataProvider={listProvider}
                keyEditable={true}
                itemActions={() => []}
                postActionContent={undefined}
              />
            </>
          }
        />
        {listProvider.edit && (
          <Route
            path={"/show-list/:name/*"}
            element={
              <>
                <PlaylistHelmShowListRoute
                  getListContentProvider={getListContentProvider}
                  keyEditable={true}
                  itemActions={() => []}
                />
              </>
            }
          />
        )}
        {NoRouteElement}
      </Routes>
    </>
  );
};
