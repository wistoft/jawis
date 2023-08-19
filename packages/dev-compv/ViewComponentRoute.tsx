import React, { memo } from "react";

import { JsLink, UseKeyListener, Link, useParams } from "^jab-react";
import { tryProp } from "^jab";

import { ViewComponent, ComponentDef } from "./internal";

export type ViewComponentRouteProps = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
};

/**
 *
 */
export const ViewComponentRoute: React.FC<ViewComponentRouteProps> = memo(
  (props) => {
    //get params from url

    const params = useParams();

    const id = tryProp(params, "component");

    //lookup "props"

    const flat = props.folders.reduce<ComponentDef[]>(
      (acc, cur) => acc.concat(cur.comps),
      []
    );

    const component = flat.find((comp) => comp.urlSafePath === id);

    //key listener

    props.useKeyListener((e) => {
      if (component) {
        if (e.key === "e") {
          props.openComponnent(component.path);
        }
      }
    });

    //render

    if (component) {
      return (
        <>
          <nav style={{ color: "var(--link-color)" }}>
            <Link to="..">Home</Link>,{" "}
            <JsLink
              name={component.path.replace(/^\.\//, "")}
              onClick={() => props.openComponnent(component.path)}
            />
          </nav>
          <br />
          {<ViewComponent {...component} />}
        </>
      );
    } else {
      return <>Component not found</>;
    }
  }
);

ViewComponentRoute.displayName = "ViewComponentRoute";
