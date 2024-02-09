import React from "react";

import { TestProvision } from "^jarun";
import { ComponentMenu } from "^jab-react";
import { getHtml } from "^misc/node";

import { filterReact, getComponentMenu } from "../_fixture";

export default (prov: TestProvision) => {
  filterReact(prov);

  //no components

  prov.chk(getHtml(getComponentMenu({}, "/")).includes("No Route for: "));

  //
  //one route
  //

  prov.chk(
    getHtml(
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

  prov.chk(getHtml(getComponentMenu(def2, "/")).includes("first route"));
  prov.chk(getHtml(getComponentMenu(def2, "/second")).includes("second route"));

  //
  //nested panel
  //

  const parent = {
    routes: [
      { name: "parent1", elm: <>1st parent route</> },
      { name: "parent2", elm: <ComponentMenu routes={def2.routes} /> },
    ],
  };

  prov.chk(getHtml(getComponentMenu(parent, "/parent1")).includes("1st parent route")); // prettier-ignore
  prov.chk(getHtml(getComponentMenu(parent, "/parent2")).includes("first route")); // prettier-ignore

  //
  // space in routes
  //

  const def3 = {
    routes: [
      { name: "first", elm: <>first route</> },
      { name: "my route", elm: <>my content</> },
    ],
  };

  prov.chk(getHtml(getComponentMenu(def3, "/my route")).includes("my content")); // prettier-ignore
};
