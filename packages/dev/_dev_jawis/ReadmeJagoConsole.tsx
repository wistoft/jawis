import React, { useState } from "react";
import { Console } from "^jagov";

export const Component: React.FC = () => {
  return (
    <Console
      //get console output on the server.
      apiPath={"localhost:3001/jago"}
      projectRoot={""}
    />
  );
};
