import React, { useLayoutEffect, useRef, useState } from "react";

import "./util.css";

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
      <div
        className="scrollbox"
        style={{ overflow: "auto", maxHeight: "200px", width: "200px" }}
      >
        <ul>
          <li>2</li>
          <li>3</li>
          <li>4</li>
          <li>5</li>
          <li>6</li>
          <li>7</li>
          <li>8</li>
          <li>9</li>
          <li>10</li>
        </ul>
      </div>
      <div
        className="scrollbox"
        style={{ overflow: "auto", maxHeight: "200px", width: "200px" }}
      >
        1<br />
        2<br />
        3<br />
        4<br />
        5<br />
        6<br />
        7<br />
        8<br />
        9<br />
        8<br />
        7<br />
      </div>
    </>
  );
};
