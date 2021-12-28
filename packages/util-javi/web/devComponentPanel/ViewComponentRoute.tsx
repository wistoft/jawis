import React, { memo } from "react";
import { Link, useMatch } from "@reach/router";

import { JsLink, UseKeyListener } from "^jab-react";
import { tryProp } from "^jab";

import { ViewComponent } from "./ViewComponent";

import { ComponentDef } from ".";
import { toUrl } from "./util";

export type Props = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
  mountPath: string; //needed because useParams doesn't work.
};

/**
 *
 * - `useParams` doesn't work here. `useMatch` does. It must have something to do with the route of the parent: '/:component/*'
 */
export const ViewComponentRoute: React.FC<Props> = memo((props) => {
  //get params from url
  const match = useMatch(props.mountPath + "/:component/*");

  const id = tryProp(match, "component");

  //lookup "props"

  const flat = props.folders.reduce<ComponentDef[]>(
    (acc, cur) => acc.concat(cur.comps),
    []
  );

  const found = flat.find((comp) => toUrl(comp.path) === id);

  //key listener

  props.useKeyListener((e) => {
    if (e.target instanceof HTMLInputElement) {
      //todo find all that expects text input.
      return;
    }

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
