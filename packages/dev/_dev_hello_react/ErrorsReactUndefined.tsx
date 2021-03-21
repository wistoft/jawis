import React from "react";

export const ErrorsReactUndefined: React.FC = () => {
  const Undefined = undefined as any;

  return <Undefined />;
};

ErrorsReactUndefined.displayName = "ErrorsReactUndefined";
