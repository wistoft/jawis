import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "^jab-react";

import { DataProvider } from "./internal";

type Props = {
  onSubmit: NonNullable<DataProvider["edit"]>;
  initial: FormData;
  keyEditable: boolean;
};

type FormData = {
  name: string;
  data: string;
};

/**
 *
 */
export const ViewEdit: React.FC<Props> = ({
  onSubmit,
  initial,
  keyEditable,
}) => {
  const navigate = useNavigate();
  const [data, setData] = useState<FormData>(initial);

  return (
    <>
      <Link to={"../"}>back</Link>
      <form
        onSubmit={function (e) {
          e.preventDefault();
          onSubmit(initial.name, data.name, data.data);
          navigate("../");
        }}
      >
        Name:{" "}
        <input
          type="text"
          id="name"
          name={data.name}
          defaultValue={data.name}
          disabled={!keyEditable}
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
          defaultValue={data.data}
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
