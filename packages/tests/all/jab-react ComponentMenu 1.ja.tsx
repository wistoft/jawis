import React from "react";

import { TestProvision } from "^jarun";
import { ComponentMenu } from "^jab-react";
import { getHtmlRTR } from "^misc/node";

import { getComponentMenu } from "../_fixture";

export default ({ chk }: TestProvision) => {
  //no components

  chk(getHtmlRTR(getComponentMenu({}, "/")).includes("No Route for: "));

  //
  //one route
  //

  chk(
    getHtmlRTR(
      getComponentMenu(
        {
          routes: [{ name: "first", elm: <>first route</> }],
        },
        "/"
      )
    ).includes("first route")
  );

  //
  //two routes
  //

  const def2 = {
    routes: [
      { name: "first", elm: <>first route</> },
      { name: "second", elm: <>second route</> },
    ],
  };

  chk(getHtmlRTR(getComponentMenu(def2, "/")).includes("first route"));
  chk(getHtmlRTR(getComponentMenu(def2, "/second")).includes("second route"));

  //
  //nested panel
  //

  const parent = {
    routes: [
      { name: "parent1", elm: <>1st parent route</> },
      { name: "parent2", elm: <ComponentMenu routes={def2.routes} /> },
    ],
  };

  chk(getHtmlRTR(getComponentMenu(parent, "/parent1")).includes("1st parent route")); // prettier-ignore
  chk(getHtmlRTR(getComponentMenu(parent, "/parent2")).includes("first route")); // prettier-ignore

  //
  // space in routes
  //

  const def3 = {
    routes: [
      { name: "first", elm: <>first route</> },
      { name: "my route", elm: <>my content</> },
    ],
  };

  chk(getHtmlRTR(getComponentMenu(def3, "/my route")).includes("my content")); // prettier-ignore
};
