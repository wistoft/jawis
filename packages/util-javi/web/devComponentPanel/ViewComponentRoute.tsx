import React, { memo } from "react";
import { Link, useParams } from "@reach/router";

import { JsLink, UseKeyListener } from "^jab-react";
import { assertPropString } from "^jab";

import { ViewComponent } from "./ViewComponent";

import { toUrl } from "./util";
import { ComponentDef } from ".";

export type Props = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
};

/**
 *
 */
export const ViewComponentRoute: React.FC<Props> = memo((props) => {
  //get params from url

  const params = useParams();

  const id = assertPropString(params, "component");

  //lookup "props"

  const flat = props.folders.reduce<ComponentDef[]>(
    (acc, cur) => acc.concat(cur.comps),
    []
  );

  const found = flat.find((comp) => toUrl(comp.path) === id);

  //key listener

  props.useKeyListener((e) => {
    if (e.key === "e") {
      if (found) {
        props.openComponnent(found.path);
      }
    }
  });

  //render

  if (found) {
    return (
      <>
        <nav style={{ color: "var(--link-color)" }}>
          <Link to="..">Home</Link>,{" "}
          <JsLink
            name={found.path.replace(/^\.\//, "")}
            onClick={() => props.openComponnent(found.path)}
          />
        </nav>
        <br />
        {<ViewComponent {...found} />}
      </>
    );
  } else {
    return <>Component not found</>;
  }
});

ViewComponentRoute.displayName = "ViewComponentRoute";
