import React from "react";
import { TestProvision } from "^jarun";
import { getHtml } from "^misc/node";

//reveals bugs in `@testing-library/react`, `renderToStaticMarkup` and RTR

export default (prov: TestProvision) => {
  prov.log(
    "span nbsp",
    getHtml(
      <span>
        {"a"}
        &nbsp;&nbsp;
        {"b"}
      </span>
    )
  );
};
