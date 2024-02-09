import React from "react";

import { TestProvision } from "^jarun";
import { getHtml } from "^misc/node";
import { toUrl } from "^dev-compv/util";
import { filterReact, getDevComponentPanel } from "../_fixture";

export default (prov: TestProvision) => {
  filterReact(prov);

  //
  // no component
  //

  prov.chk(getHtml(getDevComponentPanel({}, "/")).includes("Home"));
  prov.chk(getHtml(getDevComponentPanel({}, "/blabla")).includes("Component not found")); // prettier-ignore

  const DummyComp: React.FC = () => <>DummyComp</>;

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
  prov.chk(getHtml(getDevComponentPanel({ folders: oneComponent }, "/")).includes('href="/path_to_hej_tsx"')); // prettier-ignore

  // show component
  prov.chk(
    getHtml(
      getDevComponentPanel(
        { folders: oneComponent },
        "/" + toUrl("path/to/hej.tsx")
      )
    ).includes("DummyComp")
  );
};
