import React, { useLayoutEffect, useRef, useState } from "react";

import { JsLink } from "^jab-react";

/**
 *
 */
export const Component: React.FC = () => {
  const [overflow, setOverflow] = useState(false);
  const [content, setContent] = useState("hej dav");

  const divRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const elm = divRef.current;
    if (elm) {
      setOverflow(elm.clientHeight < elm.scrollHeight);
    }
  });

  return (
    <>
      <JsLink
        name="add"
        onClick={() => {
          setContent((old) => old + " hej dav");
        }}
      />
      <JsLink
        name=", reset"
        onClick={() => {
          setContent("hej");
        }}
      />
      <br />
      {overflow && "overflow"}
      <div
        ref={divRef}
        style={{
          maxWidth: "100px",
          maxHeight: "40px",
          background: "dodgerblue",
        }}
      >
        {content}
      </div>
    </>
  );
};
