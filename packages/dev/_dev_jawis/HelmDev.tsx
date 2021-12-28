import React, { useState } from "react";

import { DataItem, DataProvider, HelmDirector } from "^util-javi/web/helm";

const data: DataItem[] = [
  {
    name: "2",
    data: "c",
  },
  {
    name: "3",
    data: "b",
  },
  {
    name: "1",
    data: "a",
  },
];

/**
 *
 */
export const HelmDev: React.FC = () => {
  const [inMemoryProvider, setInMemoryProvider] = useState(data);

  const dataProvider: DataProvider = {
    data: inMemoryProvider,
    delete: (name: string) => {
      setInMemoryProvider((old) => old.filter((item) => item.name !== name));
    },
    new: (name: string, data: string) => {
      setInMemoryProvider((old) => [...old, { name, data }]);
    },
  };

  return <HelmDirector dataProvider={dataProvider} />;
};
