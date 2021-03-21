import React from "react";

import { JsLink, ClickableDivBackground } from "^jab-react";

/**
 *
 */
export const ClickableDivBackgroudDev: React.FC = () => {
  return (
    <>
      <ClickableDivBackground
        onClick={() => {
          console.log("div");
        }}
        style={{ background: "dodgerblue" }}
      >
        hej{" "}
        <JsLink
          name={"link"}
          onClick={() => {
            console.log("link");
          }}
        />
      </ClickableDivBackground>
      <br />
      <br />

      <ClickableDivBackground
        onClick={() => {
          console.log("div");
        }}
        style={{
          background: "gray",
          whiteSpace: "pre",
          fontFamily: "Courier New, monospace",
        }}
      >
        <JsLink
          onClick={() => {
            console.log("jslink");
          }}
          style={{ color: "blue", background: "green" }}
        >
          multi
          <br />
          {"\t\t\t\t"}link
        </JsLink>
        <br />
        <span style={{ background: "red", cursor: "auto" }}>
          multi
          <br />
          {"\t\t"}span sdf sdfl{" "}
        </span>
      </ClickableDivBackground>
    </>
  );
};
