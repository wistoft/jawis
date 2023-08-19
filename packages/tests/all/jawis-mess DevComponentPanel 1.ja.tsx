import React from "react";

import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^misc/node";
import { toUrl } from "^dev-compv/util";
import { getDevComponentPanel } from "../_fixture";

export default ({ chk }: TestProvision) => {
  //
  // no component
  //

  chk(getHtmlRTR(getDevComponentPanel({}, "/")).includes("Home"));
  chk(getHtmlRTR(getDevComponentPanel({}, "/blabla")).includes("Component not found")); // prettier-ignore

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
  chk(getHtmlRTR(getDevComponentPanel({ folders: oneComponent }, "/")).includes('href="/path_to_hej_tsx"')); // prettier-ignore

  // show component
  chk(
    getHtmlRTR(
      getDevComponentPanel(
        { folders: oneComponent },
        "/" + toUrl("path/to/hej.tsx")
      )
    ).includes("DummyComp")
  );
};
