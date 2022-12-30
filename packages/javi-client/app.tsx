import React from "react";
import ReactDOM from "react-dom";

import { JaviDirector, getClientConf } from "./internal";

const conf = getClientConf();

ReactDOM.render(
  <React.StrictMode>
    <JaviDirector {...conf} />
  </React.StrictMode>,
  document.getElementById("root")
);
