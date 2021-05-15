import React from "react";

import { TestProvision } from "^jarun";
import { getHtmlEnzyme } from "^misc/node";
import { getDevComponentPanel } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlEnzyme(getDevComponentPanel()));

  const DummyComp = () => <></>;

  imp(
    getHtmlEnzyme(
      getDevComponentPanel({
        folders: [
          {
            folder: "path/to",
            comps: [{ name: "hej", path: "path/to/hej", comp: DummyComp }],
          },
        ],
      })
    )
  );
};
//
