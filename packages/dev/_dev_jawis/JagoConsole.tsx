import React from "react";

import { JsLink } from "^jab-react";
import { Console } from "^jagov";

/**
 *
 */
export const Component: React.FC = () => {
  return (
    <>
      <JsLink
        name="log"
        onClick={() => {
          console.log("some log message");
        }}
      />
      ,{" "}
      <JsLink
        name="throw"
        onClick={() => {
          throw new Error("ups");
        }}
      />
      <i> - note: live console disabled</i>
      <br />
      <br />
      <br />
      <Console
        apiPath={"localhost:3001/jago"}
        projectRoot={""}
        removePathPrefix={""}
        initialShowSystemFrames={false}
      />
    </>
  );
};
