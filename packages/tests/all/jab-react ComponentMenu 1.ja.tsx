import React from "react";

import { TestProvision } from "^jarun";
import { ComponentMenu } from "^jab-react";

import { filterReact, getComponentMenu, getPrettyHtml } from "../_fixture";

export default async (prov: TestProvision) => {
  filterReact(prov);

  //no components

  prov.chk(
    (await getPrettyHtml(getComponentMenu({}, "/"))).includes("No Route for:")
  );

  //
  //one route
  //

  prov.chk(
    (
      await getPrettyHtml(
        getComponentMenu(
          {
            routes: [{ name: "first", elm: <>first route</> }],
          },
          "/"
        )
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

  prov.chk(
    (await getPrettyHtml(getComponentMenu(def2, "/"))).includes("first route")
  );
  prov.chk(
    (await getPrettyHtml(getComponentMenu(def2, "/second"))).includes(
      "second route"
    )
  );

  //
  //nested panel
  //

  const parent = {
    routes: [
      { name: "parent1", elm: <>1st parent route</> },
      { name: "parent2", elm: <ComponentMenu routes={def2.routes} /> },
    ],
  };

  prov.chk((await getPrettyHtml(getComponentMenu(parent, "/parent1"))).includes("1st parent route")); // prettier-ignore
  prov.chk((await getPrettyHtml(getComponentMenu(parent, "/parent2"))).includes("first route")); // prettier-ignore

  //
  // space in routes
  //

  const def3 = {
    routes: [
      { name: "first", elm: <>first route</> },
      { name: "my route", elm: <>my content</> },
    ],
  };

  prov.chk((await getPrettyHtml(getComponentMenu(def3, "/my route"))).includes("my content")); // prettier-ignore
};
