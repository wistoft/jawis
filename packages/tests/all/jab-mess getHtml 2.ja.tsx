import React from "react";
import { TestProvision } from "^jarun";
import { getHtml } from "^misc/node";

//reveals bugs in `pretty-format` with plugin ReactTestComponent

export default (prov: TestProvision) => {
  prov.log(
    "span with array",
    getHtml(
      <span>
        {"a"}
        {""}
        {"b"}
      </span>
    )
  );

  prov.log(
    "fragment with array",
    getHtml(
      <>
        {"a"}
        {""}
        {"b"}
      </>
    )
  );
};
