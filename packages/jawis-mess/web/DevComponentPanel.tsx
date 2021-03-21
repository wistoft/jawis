import { Link, Router } from "@reach/router";
import React, { memo, ReactElement, useEffect } from "react";
import { NoRoute, ReachRoute } from "^jab-react";

import { CompDef } from "..";

export type DevComponentPanelProps = {
  folders: { folder: string; comps: CompDef[] }[];
};

/**
 *
 */
export const DevComponentPanel: React.FC<DevComponentPanelProps> = memo(
  (props) => {
    const compRoutes = props.folders.reduce<ReactElement[]>(
      (acc, cur) => acc.concat(cur.comps.map(defToRoute)),
      []
    );

    return (
      <>
        <nav>
          <Link to=".">Home</Link>
        </nav>
        <br />
        <Router>
          <ReachRoute path="/" element={<Home {...props} />} />
          <NoRoute path="*" />
          {compRoutes}
        </Router>
      </>
    );
  }
);

DevComponentPanel.displayName = "DevComponentPanel";

//
// util
//

/**
 * Show a folder with components/functions.
 */
export const Home: React.FC<DevComponentPanelProps> = memo(({ folders }) => (
  <>
    {folders.map((def) => (
      <React.Fragment key={def.folder}>
        {def.folder}
        <br />
        <HomeInner key={def.folder} comps={def.comps} />
        <br />
      </React.Fragment>
    ))}
  </>
));

Home.displayName = "Home";

/**
 * Show individual exports components/functions
 */
export const HomeInner: React.FC<{ comps: CompDef[] }> = memo(({ comps }) => (
  <>
    {comps.map((def) => (
      <React.Fragment key={def.name}>
        <Link to={toUrl(def.path)}>{def.name}</Link>
        <br />
      </React.Fragment>
    ))}
  </>
));

HomeInner.displayName = "HomeInner";

/**
 * - encodeURI in order to preserve slashes
 */
const toUrl = (path: string) => encodeURI(path.replace(/\.tsx?$/, ""));

/**
 * Turn a definition into a route.
 */
const defToRoute = (def: CompDef) => {
  if (def.path.endsWith(".tsx")) {
    //it's an ordinary component.
    const Comp = def.comp;
    return (
      <ReachRoute key={def.name} path={toUrl(def.path)} element={<Comp />} />
    );
  } else {
    //it's an function, and needs to be wrapped.
    return (
      <ReachRoute
        key={def.name}
        path={toUrl(def.path)}
        element={<FunkyComponent func={def.comp} />}
      />
    );
  }
};

/**
 * Execute a plain function at mount.
 *
 * - execute async, to avoid react seeing exceptions the function might throw.
 */
export const FunkyComponent: React.FC<{ func: any }> = (props) => {
  if (typeof props.func === "function") {
    useEffect(() => {
      setTimeout(props.func, 0);
    }, []);

    return null;
  } else {
    return <>{"File didn't export a function."}</>;
  }
};
