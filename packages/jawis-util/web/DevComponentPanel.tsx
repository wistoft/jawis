import { Link, Router } from "@reach/router";
import React, { memo, ReactElement, useEffect } from "react";

import { NoRoute, ReachRoute } from "^jab-react";

export type ComponentDef = {
  name: string;
  path: string;
  comp: React.ComponentType<unknown>;
};

export type Props = {
  contexts: {
    folder: string;
    context: __WebpackModuleApi.RequireContext;
  }[];
};

export type InnerProps = {
  folders: { folder: string; comps: ComponentDef[] }[];
};

/**
 *
 */
export const DevComponentPanel: React.FC<Props> = memo((props) => {
  const folders = props.contexts.map((elm) => ({
    folder: elm.folder,
    comps: mapContext(elm.context),
  }));

  return <InnerPanel folders={folders} />;
});

DevComponentPanel.displayName = "DevComponentPanel";

/**
 *
 */
export const InnerPanel: React.FC<InnerProps> = memo((props) => {
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
        <ReachRoute path="/" element={<Home folders={props.folders} />} />
        <NoRoute path="*" />
        {compRoutes}
      </Router>
    </>
  );
});

InnerPanel.displayName = "InnerPanel";

//
// util
//

/**
 * Show a folder with components/functions.
 */
export const Home: React.FC<InnerProps> = memo(({ folders }) => (
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
export const HomeInner: React.FC<{ comps: ComponentDef[] }> = memo(
  ({ comps }) => (
    <>
      {comps.map((def) => (
        <React.Fragment key={def.name}>
          <Link to={toUrl(def.path)}>{def.name}</Link>
          <br />
        </React.Fragment>
      ))}
    </>
  )
);

HomeInner.displayName = "HomeInner";

/**
 * - encodeURI in order to preserve slashes
 */
const toUrl = (path: string) => encodeURI(path.replace(/\.tsx?$/, ""));

/**
 * Turn a definition into a route.
 */
const defToRoute = (def: ComponentDef) => {
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

/**
 *
 */
export const mapContext = (components: __WebpackModuleApi.RequireContext) =>
  components.keys().map<ComponentDef>((compName) => {
    const exports = components(compName);

    //we have the folder, so we could build the path outselfes.
    const maybePath = components.resolve(compName); // in production, webpack returns a number here.

    const path =
      typeof maybePath === "string"
        ? maybePath.replace(/^\.\/packages\//, "")
        : "unknown path";

    //picks the first export.
    for (const key in exports) {
      return {
        name: compName.replace(/^.*\/(.*)\.tsx?$/, "$1"),
        path,
        comp: exports[key] as React.ComponentType<unknown>,
      };
    }

    throw new Error("nothing exported");
  });
