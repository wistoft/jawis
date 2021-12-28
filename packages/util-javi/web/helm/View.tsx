import { Link } from "@reach/router";
import React, { useRef, useState } from "react";
import { def } from "^jab";

import { JsLink } from "^jab-react";
import { DataItem, DataProvider } from "./HelmDirector";

type Props = {
  dataProvider: DataProvider;
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
export const View: React.FC<Props> = ({ dataProvider }) => {
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
            <th></th>
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
          {cache.current.sorted.map((item) => (
            <tr key={item.name}>
              <td>
                {dataProvider.delete && (
                  <>
                    <JsLink
                      name="delete"
                      onClick={() => def(dataProvider.delete)(item.name)}
                    />
                  </>
                )}
              </td>
              <td>{item.name}</td>
              <td>{item.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
