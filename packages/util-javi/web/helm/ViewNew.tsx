import { Link, useNavigate } from "@reach/router";
import React, { useState } from "react";

import { DataProvider } from "./HelmDirector";

type Props = {
  onNew: NonNullable<DataProvider["new"]>;
};

type FormData = {
  name: string;
  data: string;
};

/**
 *
 */
export const ViewNew: React.FC<Props> = ({ onNew }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<FormData>({ name: "", data: "" });

  return (
    <>
      <Link to={"../"}>back</Link>
      <form
        onSubmit={function (e) {
          e.preventDefault();
          onNew(data.name, data.data);
          navigate("./"); //weird, would expect '../'
        }}
      >
        Name:{" "}
        <input
          type="text"
          id="name"
          name={data.name}
          onChange={(elm) => {
            const value = elm.target.value;
            return setData((old) => ({ ...old, name: value }));
          }}
        />
        <br />
        Data:{" "}
        <input
          type="text"
          id="data"
          name={data.data}
          onChange={(elm) => {
            const value = elm.target.value;
            return setData((old) => ({ ...old, data: value }));
          }}
        />
        <br />
        <input type="submit" value="Save" />
      </form>
    </>
  );
};
