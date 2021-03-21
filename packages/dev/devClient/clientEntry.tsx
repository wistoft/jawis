import React from "react";
import ReactDOM from "react-dom";

import { getClientConf } from "^javi/client";

import { DevDirector } from "./DevDirector";
import { getDevClientConf } from "./getDevClientConf";

const conf = getDevClientConf();
const javiConf = getClientConf();

ReactDOM.render(
  <React.StrictMode>
    <DevDirector {...javiConf} {...conf} />
  </React.StrictMode>,
  document.getElementById("root")
);
