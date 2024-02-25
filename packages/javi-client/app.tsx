import React from "react";

import { mountReact } from "^jab-react";

import { JaviDirector, getClientConf } from "./internal";

const conf = getClientConf();

mountReact(
  <React.StrictMode>
    <JaviDirector {...conf} />
  </React.StrictMode>,
  "root"
);
