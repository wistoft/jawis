import React from "react";
import { Route, Routes } from "react-router-dom";

import { NoRouteElement } from "^jab-react";
import { TestProvision } from "^jarun";
import { toUrl } from "^dev-compv/internal";
import { getPrettyHtml, getDevComponentPanel, filterReact } from "../_fixture";

export default async (prov: TestProvision) => {
  filterReact(prov);

  //
  // no component
  //

  prov.chk(
    (await getPrettyHtml(getDevComponentPanel({}, "/"))).includes("Home")
  );
  prov.chk((await getPrettyHtml(getDevComponentPanel({}, "/blabla"))).includes("Component not found")); // prettier-ignore

  const DummyComp = () => <>DummyComp</>;

  //
  // one component
  //

  const oneComponent = [
    {
      folder: "path/to",
      comps: [
        {
          name: "hej",
          path: "path/to/hej.tsx",
          urlSafePath: toUrl("path/to/hej.tsx"),
          comp: DummyComp,
        },
      ],
    },
  ];

  // list of components
  prov.chk((await getPrettyHtml(getDevComponentPanel({ folders: oneComponent }, "/"))).includes('href="/path_to_hej_tsx"')); // prettier-ignore

  // show component
  prov.chk(
    (
      await getPrettyHtml(
        getDevComponentPanel(
          { folders: oneComponent },
          "/" + toUrl("path/to/hej.tsx")
        )
      )
    ).includes("DummyComp")
  );

  //
  // nested router
  //

  const SubRoute = () => (
    <>
      this is shown. But can not get the route right!
      <Routes>
        <Route path={"/"} element={<>home</>} />
        <Route path={"/subroute"} element={<>sub content</>} />
        {NoRouteElement}
      </Routes>
    </>
  );

  const nestedRouter = [
    {
      folder: "path/to",
      comps: [
        {
          name: "hej",
          path: "path/to/hej.tsx",
          urlSafePath: toUrl("path/to/hej.tsx"),
          comp: DummyComp,
        },
        {
          name: "dav",
          path: "path/to/dav.tsx",
          urlSafePath: toUrl("path/to/dav.tsx"),
          comp: SubRoute,
        },
      ],
    },
  ];

  prov.log(
    "Allow extra params after the component name",
    await getPrettyHtml(
      getDevComponentPanel(
        {
          folders: nestedRouter,
        },
        "/" + toUrl("path/to/hej.tsx") + "/willGoToSubComponent"
      )
    )
  );
};
