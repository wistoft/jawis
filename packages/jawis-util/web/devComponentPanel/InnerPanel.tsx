import { Router } from "@reach/router";
import React, { memo } from "react";

import { NoRoute, ReachRoute, UseKeyListener } from "^jab-react";
import { ComponentDef } from "./Main";
import { ViewListFolders } from "./ViewList";
import { ViewComponentRoute } from "./ViewComponentRoute";

export type Props = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
};

/**
 *
 */
export const InnerPanel: React.FC<Props> = memo(
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
