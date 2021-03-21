import React from "react";

/**
 * All children must be in span to respect the "lines".
 */
export const AllFlowsDiv = () => {
  return (
    <>
      <div
        style={{ background: "green" }}
        onClick={() => {
          console.log("div");
        }}
      >
        <div
          style={{
            background: "red", // this div collapses, so a grandparent is needed.
            // width: "100px",
            // overflow: "hidden",
          }}
        >
          <span
            style={{
              background: "dodgerblue",
              float: "left",
              clear: "both",
            }}
          >
            multi
            <br />
            line
          </span>{" "}
          <span
            style={{
              background: "dodgerblue",
              float: "left",
              clear: "both",
            }}
          >
            <span
              style={{
                background: "yellow",
                float: "right",
                clear: "both",
              }}
            >
              nested
            </span>
          </span>
          <span
            style={{
              background: "yellow",
              float: "right",
              clear: "both",
            }}
          >
            right
          </span>
        </div>
        {/* this div is needed to give the parent/container height width and contain its children. */}
        <div style={{ clear: "both" }} />
      </div>
      below
    </>
  );
};

AllFlowsDiv.displayName = "AllFlowsDiv";
