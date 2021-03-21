import React from "react";

/**
 *
 */
export const SpanFillRight: React.FC = () => {
  return (
    <>
      display flex, and grow <br />
      <div
        style={{
          background: "green",
          display: "flex",
        }}
      >
        hej dav sdf sdf
        <br />
        hej dav sdf sdf
        <br />
        asdf
        <span
          style={{
            background: "red",
            flexGrow: 1,
          }}
        >
          hello
        </span>
      </div>
    </>
  );
};
