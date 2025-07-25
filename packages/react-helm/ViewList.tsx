import React, { useRef, useState } from "react";
import { Link, JsLink } from "^jab-react";

import { def } from "^jab";

import {
  DataItem,
  DataProvider,
  ItemActions,
  PostActionContent,
} from "./internal";

export type ViewListProps = {
  dataProvider: DataProvider;
  onEdit?: (name: string) => void;
  itemActions?: ItemActions;
  postActionContent?: PostActionContent;
};

const schema = {
  name: { type: "string", displayName: "Name" },
  data: { type: "string", displayName: "Data" },
};

type SortSpec = {
  name: keyof typeof schema;
  direction: "none" | "asc" | "desc";
};

const order: Array<keyof typeof schema> = ["name", "data"];

/**
 *
 */
export const ViewList: React.FC<ViewListProps> = ({
  dataProvider,
  onEdit,
  itemActions,
  postActionContent,
}) => {
  const [spec, setSortedSpec] = useState<SortSpec>(() => ({
    name: order[0],
    direction: "none",
  }));

  const cache = useRef<{
    data: DataItem[];
    sorted: DataItem[];
    spec: SortSpec;
  }>();

  if (
    cache.current?.data !== dataProvider.data ||
    cache.current?.spec !== spec
  ) {
    const sorted =
      spec.direction === "none"
        ? dataProvider.data
        : [...dataProvider.data].sort((a, b) =>
            a[spec.name] === b[spec.name]
              ? 0
              : a[spec.name] < b[spec.name]
                ? spec.direction === "asc"
                  ? -1
                  : 1
                : spec.direction === "asc"
                  ? 1
                  : -1
          );

    cache.current = { data: dataProvider.data, sorted, spec };
  }

  const extraHeaderForActions =
    itemActions &&
    itemActions("dummy").map((elm, index) => <th key={index}></th>);

  return (
    <>
      {dataProvider.new && (
        <>
          <Link to={"new"}>new</Link>
          <br />
        </>
      )}

      <table>
        <thead>
          <tr style={{ textAlign: "left" }}>
            {onEdit && <th></th>}
            {dataProvider.delete && <th></th>}
            {extraHeaderForActions}
            {postActionContent && <th></th>}

            {order.map((elm, index) => (
              <th key={index}>
                <JsLink
                  name={schema[elm].displayName}
                  onClick={() => {
                    setSortedSpec((old) => {
                      if (old.name !== elm) {
                        return { name: elm, direction: "asc" };
                      } else {
                        return {
                          name: elm,
                          direction: old.direction === "asc" ? "desc" : "asc",
                        };
                      }
                    });
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cache.current.sorted.map((item) => {
            const extraActions =
              itemActions &&
              itemActions(item.name).map((elm, index) => (
                <td key={index}>
                  <JsLink name={elm.label} onClick={() => elm.action()} />
                </td>
              ));
            return (
              <tr key={item.name}>
                {onEdit && (
                  <td>
                    <JsLink
                      name="edit"
                      onClick={() => def(onEdit)(item.name)}
                    />
                  </td>
                )}
                {dataProvider.delete && (
                  <td>
                    <JsLink
                      name="delete"
                      onClick={() => def(dataProvider.delete)(item.name)}
                    />
                  </td>
                )}
                {extraActions}
                {postActionContent && (
                  <td style={{ color: "var(--link-color)" }}>
                    {postActionContent(item.name)}
                  </td>
                )}
                <td>{item.name}</td>
                <td>{item.data}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};
