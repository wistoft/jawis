import React, { useState } from "react";

import { JsLink, ScrollbarTail } from "^jab-react";

/**
 *
 */
export const Component: React.FC = () => {
  const [numbers, setNumbers] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const divContent = numbers.map((elm) => (
    <React.Fragment key={elm}>
      <span>{elm}</span>
      <br />
    </React.Fragment>
  ));

  return (
    <>
      <JsLink
        name="add"
        onClick={() => {
          setNumbers((old) => [...old, old.length]);
        }}
      />
      <br />
      <br />

      <ScrollbarTail
        style={{
          border: "1px solid",
          height: "200px",
        }}
      >
        {divContent}
      </ScrollbarTail>
      <br />

      <ScrollbarTail
        style={{
          border: "1px solid",
          height: "200px",
        }}
      >
        a <br />
        b <br />
        c <br />
        d <br />
        {divContent}
      </ScrollbarTail>
    </>
  );
};
