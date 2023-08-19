import React, { memo } from "react";

import { NoRouteElement, Route, Routes, UseKeyListener } from "^jab-react";
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
    <Routes>
      <Route
        path="/"
        element={
          <ViewListFolders folders={folders} openComponnent={openComponnent} />
        }
      />
      <Route
        path="/:component/*"
        element={
          <ViewComponentRoute
            folders={folders}
            openComponnent={openComponnent}
            useKeyListener={useKeyListener}
          />
        }
      />
      {NoRouteElement}
    </Routes>
  )
);
