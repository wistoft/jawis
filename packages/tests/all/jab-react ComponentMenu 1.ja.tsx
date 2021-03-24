import React from "react";

import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^jawis-mess/node";
import { ComponentMenu } from "^jab-react";

import { getComponentMenu } from "../_fixture";

export default ({ log }: TestProvision) => {
  log("no components", getHtmlEnzyme(getComponentMenu({}, "/")));

  //
  //one route
  //

  log(
    "home route",
    getHtmlEnzyme(
      getComponentMenu(
        {
          routes: [{ name: "first", elm: <>first route</> }],
        },
        "/"
      )
    )
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

  log("two routes - home route", getHtmlEnzyme(getComponentMenu(def2, "/")));
  log("two routes - 2nd route", getHtmlEnzyme(getComponentMenu(def2, "/second"))); // prettier-ignore

  //
  //nested panel
  //

  const parent = {
    routes: [
      { name: "parent1", elm: <>1st parent route</> },
      { name: "parent2", elm: <ComponentMenu routes={def2.routes} /> },
    ],
  };

  log(
    "nested - home route",
    getHtmlEnzyme(getComponentMenu(parent, "/parent2"))
  );

  //
  // space in routes
  //

  const def3 = {
    routes: [
      { name: "first", elm: <>first route</> },
      { name: "my route", elm: <>my route</> },
    ],
  };

  log("space in routes", getHtmlEnzyme(getComponentMenu(def3, "/my route")));
};
