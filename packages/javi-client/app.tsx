import React from "react";
import ReactDOM from "react-dom";

import { JaviDirector } from "./JaviDirector";
import { getClientConf } from "./getClientConf";

const conf = getClientConf();

ReactDOM.render(
  <React.StrictMode>
    <JaviDirector {...conf} />
  </React.StrictMode>,
  document.getElementById("root")
);
