import React, { memo } from "react";

import { JsLink, Link } from "^jab-react";

import { ComponentDef } from "./internal";

type Props = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
};

/**
 * Show a folder with components/functions.
 */
export const ViewListFolders: React.FC<Props> = memo(
  ({ folders, openComponnent }) => (
    <>
      <nav>
        <Link to=".">Home</Link>
      </nav>
      <br />
      {folders.map((def) => (
        <React.Fragment key={def.folder}>
          {def.folder}
          <ViewListComponents
            key={def.folder}
            comps={def.comps}
            openComponnent={openComponnent}
          />
        </React.Fragment>
      ))}
    </>
  )
);

ViewListFolders.displayName = "ViewListFolders";

/**
 * Show individual exports components/functions
 */
export const ViewListComponents: React.FC<{
  comps: ComponentDef[];
  openComponnent: (path: string) => void;
}> = memo(({ comps, openComponnent }) => (
  <div style={{ margin: "10px" }}>
    {comps.map((def) => (
      <React.Fragment key={def.name}>
        <JsLink
          name={"edit"}
          onClick={() => {
            openComponnent(def.path);
          }}
        />
        {" - "}
        <Link to={def.urlSafePath}>{def.name}</Link>
        <br />
      </React.Fragment>
    ))}
  </div>
));

ViewListComponents.displayName = "ViewListComponents";
