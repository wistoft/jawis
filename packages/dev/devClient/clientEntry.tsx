import React from "react";

import { getClientConf } from "^javi-client";
import { JaviClientConf } from "^javic";
import { mountReact } from "^jab-react";

import { DevClientConf, DevDirector } from "./DevDirector";

let jsx: any;

try {
  const javiConf = getClientConf() as JaviClientConf & DevClientConf;

  jsx = <DevDirector {...javiConf} />;
} catch (error) {
  jsx = (
    <>
      Could not load client conf from development server.
      <br /> {"" + error}
    </>
  );
}

mountReact(
  <React.StrictMode>{jsx}</React.StrictMode>,
  document.getElementById("root")
);
