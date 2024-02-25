import React from "react";

import { getClientConf } from "^javi-client";
import { mountReact } from "^jab-react";

import { DevDirector } from "./DevDirector";
import { getDevClientConf } from "./getDevClientConf";

const conf = getDevClientConf();
const javiConf = getClientConf();

mountReact(
  <React.StrictMode>
    <DevDirector {...javiConf} {...conf} />
  </React.StrictMode>,
  "root"
);
