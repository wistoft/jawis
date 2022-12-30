import { Router } from "@reach/router";
import React, { memo } from "react";

import { NoRoute, ReachRoute, UseKeyListener } from "^jab-react";
import { ComponentDef, ViewListFolders, ViewComponentRoute } from "./internal";

export type ViewProps = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
};

/**
 *
 */
export const View: React.FC<ViewProps> = memo(
  ({ folders, openComponnent, useKeyListener }) => (
    <Router>
      <ReachRoute
        path="/"
        element={
          <ViewListFolders folders={folders} openComponnent={openComponnent} />
        }
      />
      <ReachRoute
        path="/:component"
        element={
          <ViewComponentRoute
            folders={folders}
            openComponnent={openComponnent}
            useKeyListener={useKeyListener}
          />
        }
      />
      <NoRoute path="*" />
    </Router>
  )
);
