import React from "react";
import { Route, useHref } from "react-router-dom";

/**
 * to make it possible to be abstract to router implementation
 */
export { Link, useParams, Routes, Route } from "react-router-dom";

/**
 *
 */
const NoRouteHelper: React.FC = () => {
  const href = useHref(".");

  const path =
    typeof window !== "undefined" &&
    window.location?.pathname.replace(href || "", "");

  return <>No Route for: {path}</>;
};

/**
 * Display a message, that no route is found.
 *
 *  - must be an element. Else it can't be used by in react router.
 */
export const NoRouteElement = <Route path="/*" element={<NoRouteHelper />} />;
