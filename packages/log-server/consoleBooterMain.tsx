import React from "react";

import { pathJoin } from "^jab";
import { Console } from "^jagov";
import { mountReact } from "^jab-react";

/**
 * Same as JaviTemplate
 *
 *  - it gives a white flash, and disrupts styling.
 */
export const getHtml = () => {
  const body = document.getElementsByTagName("body")[0];

  return `
  <div style="display: flex; height: 100vh">
    
    <div style="flex-shrink: 100000; width: 250px"></div>

    <div
      style="
        flex-shrink: 3;
        flex-grow: 1;
        overflow-y: auto;
        padding: 10px;
        min-width: 200px;
      "
    >
      ${body.innerHTML}
    </div>
    
    <div id="root" style="flex-shrink: 1; overflow-y: auto; padding: 10px 20px 10px 10px" >
    </div>

  </div>
  `;
};

/**
 *
 */
addEventListener("load", () => {
  const body = document.getElementsByTagName("body")[0];

  const elm = document.createElement("div");

  body.prepend(elm);

  mountReact(
    <Console
      apiPath={"localhost:3003/log-server"}
      projectRoot={pathJoin(__dirname, "../..")}
    />,
    document.getElementById("root")
  );
});
