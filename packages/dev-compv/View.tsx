import React, { memo } from "react";
import { Route, Routes } from "react-router-dom";

import { NoRouteElement } from "^jab-react";

import {
  ViewComponentRoute,
  ViewListFolders,
  ViewComponentRouteProps,
} from "./internal";

/**
 * The `folders.folder` is just for displaying the heading.
 */
export type ViewProps = ViewComponentRouteProps;

/**
 *
 */
export const View: React.FC<ViewProps> = memo((props) => (
  <Routes>
    <Route path="/" element={<ViewListFolders {...props} />} />
    <Route path="/:component/*" element={<ViewComponentRoute {...props} />} />
    {NoRouteElement}
  </Routes>
));

View.displayName = "View";
