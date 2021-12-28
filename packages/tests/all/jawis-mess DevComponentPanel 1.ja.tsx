import { Router } from "@reach/router";
import React from "react";
import { NoRoute, ReachRoute } from "^jab-react";

import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { toUrl } from "^util-javi/web/devComponentPanel/util";
import { getDevComponentPanel } from "../_fixture";

export default ({ log }: TestProvision) => {
  log("Only the default home route", getHtmlEnzyme(getDevComponentPanel()));

  log(
    "No matching route",
    getHtmlEnzyme(getDevComponentPanel({}, "/mount/blabla"))
  );

  const DummyComp = () => <>DummyComp</>;

  //
  // one component
  //

  const oneComponent = [
    {
      folder: "path/to",
      comps: [{ name: "hej", path: "path/to/hej.tsx", comp: DummyComp }],
    },
  ];

  log(
    "One component - home",
    getHtmlEnzyme(
      getDevComponentPanel({
        folders: oneComponent,
      })
    )
  );

  log(
    "One component - show",
    getHtmlEnzyme(
      getDevComponentPanel(
        {
          folders: oneComponent,
        },
        "/mount/" + toUrl("path/to/hej.tsx")
      )
    )
  );

  //
  // nested router
  //
  const Route = () => (
    <>
      this is shown. But can not get the route right!
      <Router>
        <ReachRoute path={"/"} element={<>home</>} />
        <ReachRoute path={"/subroute"} element={<>sub content</>} />
        <NoRoute path="*" />
      </Router>
    </>
  );

  const nestedRouter = [
    {
      folder: "path/to",
      comps: [
        { name: "hej", path: "path/to/hej.tsx", comp: DummyComp },
        { name: "dav", path: "path/to/dav.tsx", comp: Route },
      ],
    },
  ];

  log(
    "Allow extra params after the component name",
    getHtmlEnzyme(
      getDevComponentPanel(
        {
          folders: nestedRouter,
        },
        "/mount/" + toUrl("path/to/hej.tsx") + "/willGoToSubComponent"
      )
    )
  );

  log(
    "Allow extra params after the component name 2",
    getHtmlEnzyme(
      getDevComponentPanel(
        {
          folders: nestedRouter,
        },
        "/mount/" + toUrl("path/to/dav.tsx")
      )
    )
  );
};
