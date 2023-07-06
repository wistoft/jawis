import React from "react";

import { TestProvision } from "^jarun";
import { getHtmlRTR } from "^misc/node";
import { getDevComponentPanel } from "../_fixture";

export default ({ imp }: TestProvision) => {
  imp(getHtmlRTR(getDevComponentPanel()));

  const DummyComp = () => <></>;

  imp(
    getHtmlRTR(
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
