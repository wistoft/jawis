import React, { useEffect } from "react";

import { ComponentDef } from "./internal";

/**
 * - encode, so it doesn't interfere with the url.
 * - replace 'dots', because history fallback will not server 'index.html', when url has a '.ts' ending.
 */
export const toUrl = (path: string) => path.replace(/[./]/g, "_");

/**
 * Execute a plain function at mount.
 *
 * - execute async, to avoid react seeing exceptions the function might throw.
 */
export const FunkyComponent: React.FC<{ func: any }> = (props) => {
  let errMsg = "";

  if (typeof props.func === "function") {
    useEffect(() => {
      setTimeout(props.func, 0);
    }, []);
  } else {
    errMsg = "File didn't export a function.";
  }

  return <>{errMsg}</>;
};

/**
 *
 */
export const mapWebpackContext = (
  components: __WebpackModuleApi.RequireContext
) =>
  components.keys().map<ComponentDef>((compName) => {
    const exports = components(compName);

    //we have the folder, so we could build the path outselfes.

    const maybePath = components.resolve(compName); // in production, webpack returns a number here.

    const path = typeof maybePath === "string" ? maybePath : "unknown path";

    //picks the first export.

    if ("Component" in exports) {
      return {
        name: compName.replace(/^.*\/(.*)\.tsx?$/, "$1"),
        path,
        urlSafePath: toUrl(path),
        comp: exports["Component"] as React.ComponentType<unknown>,
      };
    }

    // nothing exported

    return {
      name:
        compName.replace(/^.*\/(.*)\.tsx?$/, "$1") +
        " - Should export a variable named Component.",
      path,
      urlSafePath: toUrl(path),
      comp: () => {
        return <>Should export a variable named Component</>;
      },
    };
  });
