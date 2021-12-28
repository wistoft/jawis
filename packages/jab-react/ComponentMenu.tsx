import React, { memo, ReactElement } from "react";
import { Link, Router } from "@reach/router";

import { NoRoute, ReachRoute, UseFirstRouteEffectProvider } from ".";

export type RouteDef = {
  name: string;
  elm: ReactElement<unknown>;
};

export type ComponentMenuProps = {
  routes: RouteDef[];
  postNav?: ReactElement<unknown>;
  provideFirstRouteEffect?: boolean; //default false.
};

/**
 *
 */
export const ComponentMenu: React.FC<ComponentMenuProps> = memo((props) => {
  const { menu, routes } = getStuff(props.routes);

  const helper = props.provideFirstRouteEffect ? (
    <UseFirstRouteEffectProvider path="/">
      {routes}
      <NoRoute path="*" />
    </UseFirstRouteEffectProvider>
  ) : (
    <>
      {routes}
      <NoRoute path="*" />
    </>
  );

  return (
    <>
      <nav>
        <span style={{ color: "var(--link-color)" }}>{menu}</span>
        {props.postNav}
      </nav>
      <Router>{helper}</Router>
    </>
  );
});

ComponentMenu.displayName = "ComponentMenu";

//
// util
//

/**
 *
 */
const getStuff = (routeDefs: RouteDef[]) => {
  const menu: JSX.Element[] = [];
  const routes: JSX.Element[] = [];

  let i = 0;

  for (const def of routeDefs) {
    //first route has different path

    let linkPath: string;
    let routePath: string;

    if (routes.length === 0) {
      linkPath = "./";
      routePath = "/*";
    } else {
      linkPath = encodeURIComponent(def.name);
      routePath = "/" + encodeURIComponent(def.name) + "/*";
    }

    //route

    routes.push(
      <ReachRoute key={def.name} path={routePath} element={def.elm} />
    );

    //separeater for menu entries

    if (menu.length > 0) {
      menu.push(<React.Fragment key={i++}>, </React.Fragment>);
    }

    //the entry

    menu.push(
      <Link key={i++} to={linkPath}>
        {def.name}
      </Link>
    );
  }

  return { menu, routes };
};
