import "./style.css";

import React from "react";

import { ErrorBoundary } from "^jab-react";

import { ClientRouteDef } from "^javic";

/**
 *
 */
export const ClientRoute: React.FC<ClientRouteDef> = ({ name, file }) => {
  return (
    <ErrorBoundary renderOnError={"Route failed: " + name}>
      <>{file}</>
    </ErrorBoundary>
  );
};
