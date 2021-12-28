import { Router } from "@reach/router";
import React, { memo } from "react";

import { NoRoute, ReachRoute, UseKeyListener } from "^jab-react";
import { ComponentDef } from "./Main";
import { ViewListFolders } from "./ViewList";
import { ViewComponentRoute } from "./ViewComponentRoute";

/**
 * The `folders.folder` is just for displaying the heading.
 */
export type Props = {
  folders: { folder: string; comps: ComponentDef[] }[];
  openComponnent: (path: string) => void;
  useKeyListener: UseKeyListener;
  mountPath: string;
};

/**
 *
 */
export const InnerPanel: React.FC<Props> = memo(
  ({ folders, openComponnent, useKeyListener, mountPath }) => (
    <Router>
      <ReachRoute
        path="/"
        element={
          <ViewListFolders folders={folders} openComponnent={openComponnent} />
        }
      />
      <ReachRoute
        path="/:component/*"
        element={
          <ViewComponentRoute
            folders={folders}
            openComponnent={openComponnent}
            useKeyListener={useKeyListener}
            mountPath={mountPath}
          />
        }
      />
      <NoRoute path="*" />
    </Router>
  )
);
