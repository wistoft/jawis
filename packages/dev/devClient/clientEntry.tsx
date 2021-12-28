import React from "react";
import ReactDOM from "react-dom";

import { getClientConf } from "^javi-client";

import { DevDirector } from "./DevDirector";
import { getDevClientConf } from "./getDevClientConf";

const conf = getDevClientConf();

let jsx: any;

try {
  //this will throw if the development server isn't running.
  const javiConf = getClientConf();
  jsx = <DevDirector {...javiConf} {...conf} />;
} catch (error) {
  jsx = (
    <>
      Could not load client conf from development server.
      <br /> {"" + error}
    </>
  );
}

ReactDOM.render(
  <React.StrictMode>{jsx}</React.StrictMode>,
  document.getElementById("root")
);
