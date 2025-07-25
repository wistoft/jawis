import React, { memo } from "react";
import { Link, useParams, JsLink, UseKeyListener } from "^jab-react";

import { tryProp } from "^jab";

import {
  ViewComponent,
  ComponentDef,
  ViewComponentProps,
  ApiProv,
} from "./internal";

export type ViewComponentRouteProps = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
} & Pick<ViewComponentProps, "useProvision"> &
  ApiProv;

/**
 *
 */
export const ViewComponentRoute: React.FC<ViewComponentRouteProps> = memo(
  (props) => {
    if (props.wsState === "connected" || props.wsState === "reconnecting") {
      return <ViewComponentRouteInner {...props} />;
    } else {
      return null;
    }
  }
);

ViewComponentRoute.displayName = "ViewComponentRoute";

/**
 *
 */
const ViewComponentRouteInner: React.FC<ViewComponentRouteProps> = memo(
  (props) => {
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
        if (e.target instanceof HTMLInputElement) {
          //todo ignore all that expects text input.
          return;
        }

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
          {<ViewComponent useProvision={props.useProvision} {...component} />}
        </>
      );
    } else {
      return <>Component not found</>;
    }
  }
);

ViewComponentRouteInner.displayName = "ViewComponentRouteInner";
