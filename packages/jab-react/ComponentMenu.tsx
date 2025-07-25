import React, { memo, ReactNode } from "react";

import { Route, Routes, Link, NoRouteElement } from "./internal";

export type RouteDef = {
  name: string;
  elm: ReactNode;
};

export type ComponentMenuProps = {
  routes: RouteDef[];
  postNav?: ReactNode;
};

/**
 *
 */
export const ComponentMenu: React.FC<ComponentMenuProps> = memo((props) => {
  const { menu, routes } = getStuff(props.routes);

  return (
    <>
      <nav>
        <span style={{ color: "var(--link-color)" }}>{menu}</span>
        {props.postNav}
      </nav>
      <Routes>
        {routes}
        {NoRouteElement}
      </Routes>
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
      linkPath = def.name;
      routePath = "/" + def.name + "/*";
    }

    //route

    routes.push(<Route key={def.name} path={routePath} element={def.elm} />);

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
